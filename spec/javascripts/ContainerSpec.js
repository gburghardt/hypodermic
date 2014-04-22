describe("Hypodermic.Container", function() {

	var container, configs;

	it("throws an error if no configs are passed in the constructor", function() {
		expect(function() {
			container = new Hypodermic.Container();
		}).toThrowError("Missing required argument: configs");
	});

	describe("resolve", function() {

		beforeEach(function() {
			configs = {};
			container = new Hypodermic.Container(configs);
		});

		it("throws an error if no config exists for the given name, and true is passed as the second argument", function() {
			expect(function() {
				container.resolve("nonExistent", true);
			}).toThrowError("No configuration found for nonExistent");
		});

		it("returns null if no config exists for the given name", function() {
			expect(container.resolve("nonExistent")).toBe(null);
		});

		it("throws an error if trying to resolve an abstract config", function() {
			configs.test = {
				type: "Array",
				abstract: true
			};

			expect(function() {
				container.resolve("test");
			}).toThrowError("Cannot create resolve abstract config: test");
		});

		it("returns itself when resolving 'container'", function() {
			expect(container.resolve("container")).toBe(container);
		});

		it("returns the global context when resolving 'global'", function() {
			expect(container.resolve("global")).toBe(window);
		});

		it("returns the same object when resolving configs marked as 'singleton'", function() {
			configs.test = {
				type: "Object",
				singleton: true
			};

			var a = container.resolve("test"),
			    b = container.resolve("test");

			expect(a).toBe(b);
		});

		it("returns a new object instance each time", function() {
			configs.test = {
				type: "Object"
			};

			var a = container.resolve("test"),
			    b = container.resolve("test");

			expect(a).not.toBe(b);
		});

		describe("injects dependencies via", function() {

			window.SpecFixtures = {
				ContainerSpec: {
					Resolve: {
						Foo: function(foo, bar) {
							this.foo = foo || null;
							this.bar = bar || null;
						}
					}
				}
			};

			SpecFixtures.ContainerSpec.Resolve.Foo.prototype.foo = null;
			SpecFixtures.ContainerSpec.Resolve.Foo.prototype.bar = null;

			SpecFixtures.ContainerSpec.Resolve.Foo.prototype.setFoo = jasmine.createSpy("setFoo", function(value) {
				this.foo = value;
			}).and.callThrough();

			it("constructor injection", function() {
				configs.test = {
					type: "SpecFixtures.ContainerSpec.Resolve.Foo",
					constructorArgs: [
						{ value: 100 },
						{ value: true }
					]
				};

				var instance = container.resolve("test");

				expect(instance.foo).toBe(100);
				expect(instance.bar).toBe(true);
				expect(SpecFixtures.ContainerSpec.Resolve.Foo.prototype.setFoo)
					.not.toHaveBeenCalled();
			});

			it("property injection", function() {
				configs.test = {
					type: "SpecFixtures.ContainerSpec.Resolve.Foo",
					properties: {
						bar: { value: 100 }
					}
				};

				var instance = container.resolve("test");

				expect(instance.bar).toBe(100);
				expect(instance.foo).toBe(null);
			});

			it("setter injection", function() {
				configs.test = {
					type: "SpecFixtures.ContainerSpec.Resolve.Foo",
					properties: {
						foo: { value: 100 }
					}
				};

				var instance = container.resolve("test");

				expect(instance.foo).toBe(100);
				expect(SpecFixtures.ContainerSpec.Resolve.Foo.prototype.setFoo)
					.toHaveBeenCalledWith(100);
			});

			it("parent configs", function() {
				configs.baseTest = {
					abstract: true,
					properties: {
						foo: { value: 100 }
					}
				};

				configs.test = {
					type: "SpecFixtures.ContainerSpec.Resolve.Foo",
					parent: "baseTest",
					properties: {
						bar: { value: 3 }
					}
				};

				var instance = container.resolve("test");

				expect(instance.foo).toBe(100);
				expect(instance.bar).toBe(3);
			});

		});

	});

});