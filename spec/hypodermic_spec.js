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
				expect(this.factory._isArray([])).toBe(true);
			});
			it("returns false for Objects", function() {
				expect(this.factory._isArray({})).toBe(false);
			});
			it("returns false for null", function() {
				expect(this.factory._isArray(null)).toBe(false);
			});
			it("returns false for booleans", function() {
				expect(this.factory._isArray(true)).toBe(false);
				expect(this.factory._isArray(false)).toBe(false);
			});
			it("returns false for strings", function() {
				expect(this.factory._isArray("test")).toBe(false);
			});
		});
		describe("_isFunction", function() {
			it("returns true for Functions", function() {
				var a = function() {};
				a.prototype.foo = function() {};

				function b() {}

				expect(this.factory._isFunction(a)).toBe(true);
				expect(this.factory._isFunction(b)).toBe(true);

			});
			it("returns true for native DOM methods", function() {
				expect(this.factory._isFunction(document.getElementById)).toBe(true);
				expect(this.factory._isFunction(document.body.appendChild)).toBe(true);
			});
			it("returns true for global functions", function() {
				expect(this.factory._isFunction(window.alert)).toBe(true);
			});
			it("returns false for null", function() {
				expect(this.factory._isFunction(null)).toBe(false);
			});
			it("returns false for booleans", function() {
				expect(this.factory._isFunction(true)).toBe(false);
				expect(this.factory._isFunction(false)).toBe(false);
			});
			it("returns false for strings", function() {
				expect(this.factory._isFunction("testing")).toBe(false);
			});
		});
		describe("_isObject", function() {
			describe("returns true for", function() {
				it("Objects", function() {
					expect(this.factory._isObject({})).toBe(true);
				});
				it("Arrays", function() {
					expect(this.factory._isObject([])).toBe(true);
				});
				it("Functions", function() {
					expect(this.factory._isObject(function() {})).toBe(true);
				});
				it("String objects", function() {
					expect(this.factory._isObject(new String())).toBe(true);
				});
				it("Number objects", function() {
					expect(this.factory._isObject(new Number(32))).toBe(true);
				});
			});
			describe("returns false for", function() {
				it("null", function() {
					expect(this.factory._isObject(null)).toBe(false);
				});
				it("booleans", function() {
					expect(this.factory._isObject(null)).toBe(false);
				});
				it("string literals", function() {
					expect(this.factory._isObject("testing")).toBe(false);
				});
				it("number literals", function() {
					expect(this.factory._isObject(32)).toBe(false);
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
				expect(Klass).toBe(XMLHttpRequest);
			});
			it("requires that no special characters be present in the class name", function() {
				window.$TestInvalidGetClassReference = function() {};
				window._TestInvalidGetClassReference = function() {};
				var Klass;

				Klass = this.factory._getClassReference("$TestInvalidGetClassReference");
				expect(Klass).toBe(null);

				Klass = this.factory._getClassReference("_TestInvalidGetClassReference");
				expect(Klass).toBe(null);

				delete window.$TestInvalidGetClassReference;
				delete window._TestInvalidGetClassReference;
			});
			it("accepts underscores and $ in the class name", function() {
				window.TestSpecialChars_GetClassReference = function() {};
				window.TestSpecialChars$GetClassReference = function() {};

				var Klass = this.factory._getClassReference("TestSpecialChars_GetClassReference");
				expect(Klass).toBe(TestSpecialChars_GetClassReference);

				var Klass = this.factory._getClassReference("TestSpecialChars$GetClassReference");
				expect(Klass).toBe(TestSpecialChars$GetClassReference);

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
				expect(Klass).toBe(TestGetClassReference.A.Test.Foo);

				delete window.TestGetClassReference;
			});
		});
		describe("invalid class names return null because", function() {
			it("class names should not start with a lower case letter", function() {
				window.testGetClassReference = function() {};
				var Klass = this.factory._getClassReference("testGetClassReference");

				expect(Klass).toBe(null);
				delete window.testGetClassReference;
			});
			it("class names cannot be executable JavaScript", function() {
				spyOn(window, "alert");
				var Klass = this.factory._getClassReference("alert('Hacked!');");

				expect(window.alert).wasNotCalled();
				expect(Klass).toBe(null);

				Klass = this.factory._getClassReference("\a\Aalert\(\'Hacked\!\'\);");
				expect(window.alert).wasNotCalled();
				expect(Klass).toBe(null);

				Klass = this.factory._getClassReference("\\aA\\alert\\(\\'Hacked\\!\\'\\)\\;");
				expect(window.alert).wasNotCalled();
				expect(Klass).toBe(null);
			});
			it("did not exist in the global object", function() {
				if (window.TestGetClassReference) {
					delete window.TestGetClassReference;
				}

				var Klass = this.factory._getClassReference("TestGetClassReference");

				expect(Klass).toBe(null);
			});
			it("it throws an error when attempting to get the class reference", function() {
				var Klass = this.factory._getClassReference("I.Do.Not.Exist");

				expect(Klass).toBe(null);
			});
		});
	});
	describe("_getDependencyValue", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		it("returns an object instance from the factory if the property config has an 'id'", function() {
			var dependency = {};
			spyOn(this.factory, "getInstance").andReturn(dependency);

			var propertyConfig = {
				id: "foo"
			};

			var value = this.factory._getDependencyValue(propertyConfig);

			expect(this.factory.getInstance).wasCalledWith(propertyConfig.id);
			expect(value).toBe(dependency);
		});
		it("returns a value from the property config if the value is not 'undefined'", function() {
			spyOn(this.factory, "getInstance");

			var propertyConfig;
			var value;

			propertyConfig = {
				value: null
			};
			value = this.factory._getDependencyValue(propertyConfig);
			expect(value).toBe(null);

			propertyConfig = {
				value: "testing"
			};
			value = this.factory._getDependencyValue(propertyConfig);
			expect(value).toEqual(propertyConfig.value);

			propertyConfig = {
				value: false
			};
			value = this.factory._getDependencyValue(propertyConfig);
			expect(value).toBe(false);

			propertyConfig = {
				value: {foo: "bar"}
			};
			value = this.factory._getDependencyValue(propertyConfig);
			expect(value).toBe(propertyConfig.value);
			expect(value.foo).toEqual(propertyConfig.value.foo);
		});
		it("throws an error if there is no 'id' and no 'value' in the property config", function() {
			var factory = this.factory;

			expect(function() {
				factory._getDependencyValue({});
			}).toThrow("Cannot extract dependency value. Property config missing one of \"id\" or \"value\"");

			expect(function() {
				factory._getDependencyValue({ value: undefined });
			}).toThrow("Cannot extract dependency value. Property config missing one of \"id\" or \"value\"");

			expect(function() {
				factory._getDependencyValue({ id: undefined });
			}).toThrow("Cannot extract dependency value. Property config missing one of \"id\" or \"value\"");

			expect(function() {
				factory._getDependencyValue({id: undefined, value: undefined });
			}).toThrow("Cannot extract dependency value. Property config missing one of \"id\" or \"value\"");
		});
	});
	describe("_getConstructorArgs", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		it("returns an empty array if there are no constructor argument configs", function() {
			var config = [];
			var args = this.factory._getConstructorArgs(config);

			expect(args.length).toEqual(0);
		});
		it("returns an array of arguments passed to an object's constructor", function() {
			var config = [{
				value: 123
			},{
				id: "test"
			}];
			var test = {};

			spyOn(this.factory, "getInstance").andReturn(test);

			var args = this.factory._getConstructorArgs(config);

			expect(this.factory.getInstance).wasCalledWith(config[1].id);
			expect(args.length).toEqual(2);
			expect(args[0]).toEqual(123);
			expect(args[1]).toBe(test);
		});
		it("throws an error if one of the arguments does not have an \"id\" or \"value\"", function() {
			var config = [{ value: 123 }, {}];
			var factory = this.factory;

			expect(function() {
				factory._getConstructorArgs(config);
			}).toThrowError();
		});
	});
	describe("_injectDependencies", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		it("injects 'foo' via setFoo(foo)", function() {
			var instance = {
				foo: null,

				setFoo: function(foo) {
					this.foo = foo;
				}
			};

			var properties = {
				foo: {
					value: 123
				}
			};

			spyOn(instance, "setFoo").andCallThrough();

			this.factory._injectDependencies(instance, properties);

			expect(instance.foo).toEqual(properties.foo.value);
			expect(instance.setFoo).wasCalledWith(properties.foo.value);
		});
		it("injects 'foo' via addFoo(foo)", function() {
			var instance = {
				foos: [],

				addFoo: function(foo) {
					this.foos.push(foo);
				}
			};

			var properties = {
				foo: {
					value: 123
				}
			};

			spyOn(instance, "addFoo").andCallThrough();

			this.factory._injectDependencies(instance, properties);

			expect(instance.foos.length).toEqual(1);
			expect(instance.foos[0]).toEqual(properties.foo.value);
			expect(instance.addFoo).wasCalledWith(properties.foo.value);
		});
		it("injects 'foo' by directly setting the property", function() {
			var instance = {
				foo: null
			};

			var properties = {
				foo: {
					value: 123
				}
			};

			this.factory._injectDependencies(instance, properties);

			expect(instance.foo).toEqual(properties.foo.value);
		});
	});
	describe("_createInstanceFromConfig", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		it("creates a new instance without constructor arguments", function() {
			window.TestCreateInstanceFromConfig = function(x) {
				this.x = x;
			};

			var config = {
				className: "TestCreateInstanceFromConfig"
			};

			spyOn(window, "TestCreateInstanceFromConfig").andCallThrough();

			var instance = this.factory._createInstanceFromConfig(config);

			expect(window.TestCreateInstanceFromConfig).wasCalled();
			expect(instance.x).toBeUndefined();

			window.TestCreateInstanceFromConfig = null;
			delete window.TestCreateInstanceFromConfig;
		});
		it("creates a new instance with constructor arguments", function() {
			window.TestCreateInstanceFromConfig = {
				With: {
					ConstructorArgs: function(x, y, options) {
						this.x = x;
						this.y = y;
						this.options = options;
					}
				}
			};

			var config = {
				className: "TestCreateInstanceFromConfig.With.ConstructorArgs",
				constructorArgs: [
					{
						value: 10
					},{
						value: 5
					},{
						id: "defaultOptions"
					}
				]
			};

			var defaultOptions = {};

			spyOn(window.TestCreateInstanceFromConfig.With, "ConstructorArgs").andCallThrough();
			spyOn(this.factory, "getInstance").andReturn(defaultOptions);

			var instance = this.factory._createInstanceFromConfig(config);

			expect(this.factory.getInstance).wasCalledWith("defaultOptions");
			expect(TestCreateInstanceFromConfig.With.ConstructorArgs).wasCalledWith(10, 5, defaultOptions);
			expect(instance).toBeInstanceof(TestCreateInstanceFromConfig.With.ConstructorArgs);
			expect(instance.x).toEqual(config.constructorArgs[0].value);
			expect(instance.y).toEqual(config.constructorArgs[1].value);
			expect(instance.options).toBe(defaultOptions);

			window.TestCreateInstanceFromConfig = null;
			delete window.TestCreateInstanceFromConfig;
		});
		it("injects property dependencies", function() {
			window.TestCreateInstanceFromConfig = {
				With: {
					Properties: function() {}
				}
			};

			TestCreateInstanceFromConfig.With.Properties.prototype = {
				name: null,
				price: null,
				description: null,

				setName: function(name) {
					this.name = name;
				},

				setPrice: function(price) {
					this.price = price;
				}
			};

			spyOn(TestCreateInstanceFromConfig.With.Properties.prototype, "setName").andCallThrough();
			spyOn(TestCreateInstanceFromConfig.With.Properties.prototype, "setPrice").andCallThrough();
			spyOn(this.factory, "getInstance");

			var config = {
				className: "TestCreateInstanceFromConfig.With.Properties",
				properties: {
					name: { value: "Hammer" },
					price: { value: 12.99 },
					description: { value: "Pounds nails" }
				}
			};

			var instance = this.factory._createInstanceFromConfig(config);

			expect(this.factory.getInstance).wasNotCalled();
			expect(TestCreateInstanceFromConfig.With.Properties.prototype.setName).wasCalledWith(config.properties.name.value);
			expect(TestCreateInstanceFromConfig.With.Properties.prototype.setPrice).wasCalledWith(config.properties.price.value);
			expect(instance.description).toEqual(config.properties.description.value);

			window.TestCreateInstanceFromConfig = null;
			delete window.TestCreateInstanceFromConfig;
		});
		it("injects property dependencies from parent configs", function() {
			window.TestCreateInstanceFromConfig = {
				With: {
					ParentConfigs: function() {}
				}
			};

			TestCreateInstanceFromConfig.With.ParentConfigs.prototype = {
				taxRate: null,
				price: null,

				setPrice: function(price) {
					this.price = price;
				},

				setTaxRate: function(taxRate) {
					this.taxRate = taxRate;
				}
			};

			var proto = TestCreateInstanceFromConfig.With.ParentConfigs.prototype;

			spyOn(proto, "setPrice").andCallThrough();
			spyOn(proto, "setTaxRate").andCallThrough();
			spyOn(this.factory, "getInstance");

			var parentConfig = {
				abstract: true,
				properties: {
					taxRate: {
						value: 0.06
					}
				}
			};

			this.factory.setConfigs({
				taxable: parentConfig
			});

			var config = {
				className: "TestCreateInstanceFromConfig.With.ParentConfigs",
				parent: "taxable",
				properties: {
					price: { value: 12.99 }
				}
			};

			var instance = this.factory._createInstanceFromConfig(config);

			expect(this.factory.getInstance).wasNotCalled();
			expect(proto.setPrice).wasCalledWith(config.properties.price.value);
			expect(proto.setTaxRate).wasCalledWith(parentConfig.properties.taxRate.value);

			window.TestCreateInstanceFromConfig.With.ParentConfigs = null;
			delete window.TestCreateInstanceFromConfig.With.ParentConfigs;
		});
		it("overrides properties set by parent configs", function() {
			window.TestCreateInstanceFromConfig = {
				Override: {
					ParentConfigs: function() {}
				}
			};

			TestCreateInstanceFromConfig.Override.ParentConfigs.prototype = {
				setTaxRate: function(taxRate) {
					this.taxRate = taxRate;
				}
			};

			var proto = TestCreateInstanceFromConfig.Override.ParentConfigs.prototype;

			spyOn(proto, "setTaxRate").andCallThrough();
			spyOn(this.factory, "getInstance");

			var parentConfig = {
				abstract: true,
				properties: {
					taxRate: {
						value: 0.06
					}
				}
			};

			this.factory.setConfigs({
				taxable: parentConfig
			});

			var config = {
				className: "TestCreateInstanceFromConfig.Override.ParentConfigs",
				parent: "taxable",
				properties: {
					taxRate: { value: 0.1 }
				}
			};

			var instance = this.factory._createInstanceFromConfig(config);

			expect(this.factory.getInstance).wasNotCalled();
			expect(proto.setTaxRate).wasCalledWith(0.06);
			expect(proto.setTaxRate).wasCalledWith(0.1);
			expect(instance.taxRate).toEqual(0.1);
		});
		it("throws an error if the config is missing a className", function() {
			var factory = this.factory;

			expect(function() {
				factory._createInstanceFromConfig({});
			}).toThrow("Missing required className for instance configuration");
		});
		it("throws an error if the class in the config is not found", function() {
			var config = {
				className: "I.Do.Not.Exist"
			};

			var factory = this.factory;

			expect(function() {
				factory._createInstanceFromConfig(config);
			}).toThrow("Failed to create instance. Class \"I.Do.Not.Exist\" was not found");
		});
	});
	describe("_getSingletonInstance", function() {
		beforeEach(function() {
			this.factory = new Hypodermic();
		});
		it("creates a new singleton instance, caches it, and returns the new object", function() {
			var test = {};
			var id = "test";
			var config = {
				className: "Object",
				properties: {
					discount: { value: 0.1 }
				}
			};

			spyOn(this.factory, "_createInstanceFromConfig").andReturn(test);

			expect(this.factory._singletons[id]).toBeUndefined();

			var instance = this.factory._getSingletonInstance(id, config);

			expect(this.factory._createInstanceFromConfig).wasCalledWith(config);
			expect(this.factory._singletons[id]).toBe(test);
		});
		it("only allows one instance of that class", function() {
			var test = {};
			var id = "test";
			var config = {
				className: "Object",
				properties: {
					discount: { value: 0.1 }
				}
			};

			spyOn(this.factory, "_createInstanceFromConfig").andReturn(test);

			expect(this.factory._singletons[id]).toBeUndefined();

			var instance = this.factory._getSingletonInstance(id, config);

			expect(this.factory._createInstanceFromConfig).wasCalledWith(config);
			expect(this.factory._singletons[id]).toBe(test);
			expect(instance).toBe(test);

			instance = this.factory._getSingletonInstance(id, config);
			expect(instance).toBe(this.factory._singletons[id]);
		});
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
