describe("Hypodermic.ObjectFactory", function() {

	var factory;
	var dependencyResolver = {
		findDependency: function() {}
	};
	var container = {
		resolve: function() {}
	};

	beforeEach(function() {
		factory = new Hypodermic.ObjectFactory(container, dependencyResolver);
	});

	describe("createInstance", function() {

		it("returns a new object instance using an object constructor", function() {
			var TestClass = function() {
				this.called = true;
			};
			TestClass.prototype.called = false;

			spyOn(factory, "_getClassReference").and.returnValue(TestClass);

			var instance = factory.createInstance({ type: "TestClass" });

			expect(instance.called).toBe(true);
		});

		it("passes arguments to the object constructor", function() {
			var TestClass = function(x) {
				this.x = x;
			};
			TestClass.prototype.x = null;

			spyOn(factory, "_getClassReference").and.returnValue(TestClass);
			spyOn(dependencyResolver, "findDependency").and.returnValue(32);

			var instance = factory.createInstance({ type: "TestClass" }, [{ value: 32 }]);

			expect(dependencyResolver.findDependency).toHaveBeenCalledWith({ value: 32 });
			expect(instance.x).toBe(32);
		});

		it("returns a static object/singleton", function() {
			var TestClass = {};

			spyOn(factory, "_getClassReference").and.returnValue(TestClass);

			var instance = factory.createInstance({ type: "TestClass" });

			expect(instance).toBe(TestClass);
		});

	});

	describe("createInstanceFromFactory", function() {

		it("throws an error if the factory info is missing an 'id'", function() {
			var config = {
				factory: {
					type: "Foo"
				}
			};

			expect(function() {
				factory.createInstanceFromFactory(config);
			}).toThrowError("Missing required argument: config.factory.id");
		});

		it("passes config.factory.type if the factory info is missing an 'args' property", function() {
			var dependency = {};
			var customFactory = {
				createInstance: jasmine.createSpy("createInstance").and.returnValue(dependency)
			};
			var config = {
				factory: {
					id: "test",
					type: "foo"
				}
			};

			spyOn(container, "resolve").and.returnValue(customFactory);

			var x = factory.createInstanceFromFactory(config);

			expect(container.resolve).toHaveBeenCalledWith("test", true);
			expect(customFactory.createInstance).toHaveBeenCalledWith("foo");
			expect(x).toBe(dependency);
		});

		it("passes config.factory.type if the factory info has an empty 'args' Array", function() {
			var dependency = {};
			var customFactory = {
				createInstance: jasmine.createSpy("createInstance").and.returnValue(dependency)
			};
			var config = {
				factory: {
					id: "test",
					type: "foo",
					args: []
				}
			};

			spyOn(container, "resolve").and.returnValue(customFactory);

			var x = factory.createInstanceFromFactory(config);

			expect(container.resolve).toHaveBeenCalledWith("test", true);
			expect(customFactory.createInstance).toHaveBeenCalledWith("foo");
			expect(x).toBe(dependency);
		});

		it("resolves dependencies for the arguments if config.factory contains an 'args' Array", function() {
			factory.dependencyResolver = new Hypodermic.DependencyResolver();

			var dependency = {};
			var customFactory = {
				createInstance: jasmine.createSpy("createInstance").and.returnValue(dependency)
			};
			var config = {
				factory: {
					id: "test",
					args: [
						{ value: 123 },
						{ value: "testing" }
					]
				}
			};

			spyOn(container, "resolve").and.returnValue(customFactory);

			var x = factory.createInstanceFromFactory(config);

			expect(container.resolve).toHaveBeenCalledWith("test", true);
			expect(customFactory.createInstance).toHaveBeenCalledWith(123, "testing");
			expect(x).toBe(dependency);
		});

		it("calls a custom method on the factory object", function() {
			var dependency = {};
			var customFactory = {
				createFoo: jasmine.createSpy("createFoo").and.returnValue(dependency)
			};
			var config = {
				factory: {
					id: "test",
					method: "createFoo",
					type: "foo"
				}
			};

			spyOn(container, "resolve").and.returnValue(customFactory);

			var x = factory.createInstanceFromFactory(config);

			expect(container.resolve).toHaveBeenCalledWith("test", true);
			expect(customFactory.createFoo).toHaveBeenCalledWith("foo");
			expect(x).toBe(dependency);
		});

	});

	describe("_getClassReference", function() {

		describe("when returning a class reference", function() {

			it("class names may start with a capital letter", function() {
				var Klass = factory._getClassReference("XMLHttpRequest");
				expect(Klass).toBe(XMLHttpRequest);
			});

			it("class names may start with a lower case letter", function() {
				window.specFixtures = {
					ObjectFactorySpec: {
						Foo: function() {}
					}
				};

				var Klass = factory._getClassReference("specFixtures.ObjectFactorySpec.Foo");

				expect(Klass).toBe(specFixtures.ObjectFactorySpec.Foo);
			});

			it("class names may reference a static object", function() {
				window.specFixtures = {
					ObjectFactorySpec: {
						Bar: {}
					}
				};

				var Klass = factory._getClassReference("specFixtures.ObjectFactorySpec.Bar");

				expect(Klass).toBe(specFixtures.ObjectFactorySpec.Bar);
			});

			it("requires that no special characters be present in the class name", function() {
				window.$TestInvalidGetClassReference = function() {};
				window._TestInvalidGetClassReference = function() {};
				var Klass;

				Klass = factory._getClassReference("$TestInvalidGetClassReference");
				expect(Klass).toBe(null);

				Klass = factory._getClassReference("_TestInvalidGetClassReference");
				expect(Klass).toBe(null);

				delete window.$TestInvalidGetClassReference;
				delete window._TestInvalidGetClassReference;
			});

			it("accepts underscores and $ in the class name", function() {
				window.TestSpecialChars_GetClassReference = function() {};
				window.TestSpecialChars$GetClassReference = function() {};

				var Klass = factory._getClassReference("TestSpecialChars_GetClassReference");
				expect(Klass).toBe(TestSpecialChars_GetClassReference);

				var Klass = factory._getClassReference("TestSpecialChars$GetClassReference");
				expect(Klass).toBe(TestSpecialChars$GetClassReference);

				delete window.TestSpecialChars_GetClassReference;
				delete window.TestSpecialChars$GetClassReference;
			});

			it("namespaced class names may start with a capital letter", function() {
				window.TestGetClassReference = {
					A: {
						Test: {
							Foo: function() {}
						}
					}
				};

				var Klass = factory._getClassReference("TestGetClassReference.A.Test.Foo");
				expect(Klass).toBe(TestGetClassReference.A.Test.Foo);

				delete window.TestGetClassReference;
			});

		});

		describe("invalid class names return null because", function() {

			it("class names cannot be executable JavaScript", function() {
				spyOn(window, "alert");
				var Klass = factory._getClassReference("alert('Hacked!');");

				expect(window.alert).not.toHaveBeenCalled();
				expect(Klass).toBe(null);

				Klass = factory._getClassReference("\a\Aalert\(\'Hacked\!\'\);");
				expect(window.alert).not.toHaveBeenCalled();
				expect(Klass).toBe(null);

				Klass = factory._getClassReference("\\aA\\alert\\(\\'Hacked\\!\\'\\)\\;");
				expect(window.alert).not.toHaveBeenCalled();
				expect(Klass).toBe(null);
			});

			it("did not exist in the global object", function() {
				if (window.TestGetClassReference) {
					delete window.TestGetClassReference;
				}

				var Klass = factory._getClassReference("TestGetClassReference");

				expect(Klass).toBe(null);
			});

			it("it throws an error when attempting to get the class reference", function() {
				var Klass = factory._getClassReference("I.Do.Not.Exist");

				expect(Klass).toBe(null);
			});

		});

	});

	describe("_getConstructorArgs", function() {

		it("uses the dependencyResolver to find dependencies", function() {
			spyOn(dependencyResolver, "findDependency").and.returnValue(10);

			var args = factory._getConstructorArgs(["Foo", { value: 32 }]);

			expect(args.length).toBe(2);
			expect(dependencyResolver.findDependency).toHaveBeenCalledWith("Foo");
			expect(dependencyResolver.findDependency).toHaveBeenCalledWith({ value: 32 });
		});

	});

});