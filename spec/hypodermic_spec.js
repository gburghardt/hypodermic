describe("Hypodermic", function() {
	describe("utils", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		describe("_capitalize", function() {
			it("makes the first letter upper case", function() {
				expect(this.factory._capitalize("foo")).toEqual("Foo");
				expect(this.factory._capitalize("fooBar")).toEqual("FooBar");
			});
		});
		describe("_isArray", function() {
			it("returns true for Arrays", function() {
				expect(this.factory._isArray([])).toBeTrue();
			});
			it("returns false for Objects", function() {
				expect(this.factory._isArray({})).toBeFalse();
			});
			it("returns false for null", function() {
				expect(this.factory._isArray(null)).toBeFalse();
			});
			it("returns false for booleans", function() {
				expect(this.factory._isArray(true)).toBeFalse();
				expect(this.factory._isArray(false)).toBeFalse();
			});
			it("returns false for strings", function() {
				expect(this.factory._isArray("test")).toBeFalse();
			});
		});
		describe("_isFunction", function() {
			it("returns true for Functions", function() {
				var a = function() {};
				a.prototype.foo = function() {};

				function b() {}

				expect(this.factory._isFunction(a)).toBeTrue();
				expect(this.factory._isFunction(b)).toBeTrue();

			});
			it("returns true for native DOM methods", function() {
				expect(this.factory._isFunction(document.getElementById)).toBeTrue();
				expect(this.factory._isFunction(document.body.appendChild)).toBeTrue();
			});
			it("returns true for global functions", function() {
				expect(this.factory._isFunction(window.alert)).toBeTrue();
			});
			it("returns false for null", function() {
				expect(this.factory._isFunction(null)).toBeFalse();
			});
			it("returns false for booleans", function() {
				expect(this.factory._isFunction(true)).toBeFalse();
				expect(this.factory._isFunction(false)).toBeFalse();
			});
			it("returns false for strings", function() {
				expect(this.factory._isFunction("testing")).toBeFalse();
			});
		});
		describe("_isObject", function() {
			describe("returns true for", function() {
				it("Objects", function() {
					expect(this.factory._isObject({})).toBeTrue();
				});
				it("Arrays", function() {
					expect(this.factory._isObject([])).toBeTrue();
				});
				it("Functions", function() {
					expect(this.factory._isObject(function() {})).toBeTrue();
				});
				it("String objects", function() {
					expect(this.factory._isObject(new String())).toBeTrue();
				});
				it("Number objects", function() {
					expect(this.factory._isObject(new Number(32))).toBeTrue();
				});
			});
			describe("returns false for", function() {
				it("null", function() {
					expect(this.factory._isObject(null)).toBeFalse();
				});
				it("booleans", function() {
					expect(this.factory._isObject(null)).toBeFalse();
				});
				it("string literals", function() {
					expect(this.factory._isObject("testing")).toBeFalse();
				});
				it("number literals", function() {
					expect(this.factory._isObject(32)).toBeFalse();
				});
			});
		});
	});
	describe("_getClassReference", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		describe("when returning a class reference", function() {
			it("requires the class name start with a capital letter", function() {
				var Klass = this.factory._getClassReference("XMLHttpRequest");
				expect(Klass).toStrictlyEqual(XMLHttpRequest);
			});
			it("requires that no special characters be present in the class name", function() {
				window.$TestInvalidGetClassReference = function() {};
				window._TestInvalidGetClassReference = function() {};
				var Klass;

				Klass = this.factory._getClassReference("$TestInvalidGetClassReference");
				expect(Klass).toBeNull();

				Klass = this.factory._getClassReference("_TestInvalidGetClassReference");
				expect(Klass).toBeNull();

				delete window.$TestInvalidGetClassReference;
				delete window._TestInvalidGetClassReference;
			});
			it("accepts underscores and $ in the class name", function() {
				window.TestSpecialChars_GetClassReference = function() {};
				window.TestSpecialChars$GetClassReference = function() {};

				var Klass = this.factory._getClassReference("TestSpecialChars_GetClassReference");
				expect(Klass).toStrictlyEqual(TestSpecialChars_GetClassReference);

				var Klass = this.factory._getClassReference("TestSpecialChars$GetClassReference");
				expect(Klass).toStrictlyEqual(TestSpecialChars$GetClassReference);

				delete window.TestSpecialChars_GetClassReference;
				delete window.TestSpecialChars$GetClassReference;
			});
			it("requires namespaced class names start with a capital letter", function() {
				window.TestGetClassReference = {
					A: {
						Test: {
							Foo: function() {}
						}
					}
				};

				var Klass = this.factory._getClassReference("TestGetClassReference.A.Test.Foo");
				expect(Klass).toStrictlyEqual(TestGetClassReference.A.Test.Foo);

				delete window.TestGetClassReference;
			});
		});
		describe("invalid class names return null because", function() {
			it("class names should not start with a lower case letter", function() {
				window.testGetClassReference = function() {};
				var Klass = this.factory._getClassReference("testGetClassReference");

				expect(Klass).toBeNull();
				delete window.testGetClassReference;
			});
			it("class names cannot be executable JavaScript", function() {
				spyOn(window, "alert");
				var Klass = this.factory._getClassReference("alert('Hacked!');");

				expect(window.alert).wasNotCalled();
				expect(Klass).toBeNull();

				Klass = this.factory._getClassReference("\a\Aalert\(\'Hacked\!\'\);");
				expect(window.alert).wasNotCalled();
				expect(Klass).toBeNull();

				Klass = this.factory._getClassReference("\\aA\\alert\\(\\'Hacked\\!\\'\\)\\;");
				expect(window.alert).wasNotCalled();
				expect(Klass).toBeNull();
			});
			it("did not exist in the global object", function() {
				if (window.TestGetClassReference) {
					delete window.TestGetClassReference;
				}

				var Klass = this.factory._getClassReference("TestGetClassReference");

				expect(Klass).toBeNull();
			});
			it("it throws an error when attempting to get the class reference", function() {
				var Klass = this.factory._getClassReference("I.Do.Not.Exist");

				expect(Klass).toBeNull();
			});
		});
	});
	describe("_getDependencyValue", function() {
		xit("returns an object instance from the factory if the property config has an 'id'");
		xit("returns a value from the property config if the value is not 'undefined'");
		xit("returns null if there is no 'id' and no 'value' in the property config");
	});
	describe("_getConstructorArgs", function() {
		xit("returns an empty array if there are no constructor argument configs");
		xit("returns an array of arguments passed to an object's constructor");
	});
	describe("_injectDependencies", function() {
		xit("injects 'foo' via setFoo(foo)");
		xit("injects 'foo' via addFoo(foo)");
		xit("injects 'foo' by directly setting the property");
	});
	describe("_createInstanceFromConfig", function() {
		xit("returns null if the class in the config is not found");
		xit("creates a new instance without constructor arguments");
		xit("creates a new instance with constructor arguments");
		xit("injects property dependencies");
		xit("injects property dependencies from parent configs");
	});
	describe("_getSingletonInstance", function() {
		xit("creates a new singleton instance, caches it, and returns the new object");
		xit("only allows one instance of that class");
	});
	describe("getInstance", function() {
		xit("returns null if no configuration for that Id exists");
		xit("returns the same object instance if the config is marked as a 'singleton' object");
		xit("throws an error if the configuration for that Id is abstract");
		xit("returns a new object instance every time for configurations not marked as 'singleton' objects");
	});
	describe("setConfigs", function() {
		xit("does a shallow merge of existing object configs with new ones");
		xit("does not allow the object factory's configuration to be overwritten");
	});
});
