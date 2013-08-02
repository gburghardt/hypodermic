describe("Hypodermic", function() {
	describe("utils", function() {
		describe("_capitalize", function() {
			it("makes the first letter upper case");
		});
		describe("_isArray", function() {
			xit("returns true for Arrays");
			xit("returns false for Objects");
			xit("returns false for null");
			xit("returns false for booleans");
			xit("returns false for strings");
		});
		describe("_isFunction", function() {
			xit("returns true for Functions");
			xit("returns true for native DOM methods");
			xit("returns true for global functions");
			xit("returns false for null");
			xit("returns false for booleans");
			xit("returns false for strings");
		});
		describe("_isObject", function() {
			xit("returns true for Objects");
			xit("returns true for Arrays");
			xit("returns false for null");
			xit("returns false for booleans");
			xit("returns false for strings");
		});
	});
	describe("_getClassReference", function() {
		describe("when returning a class reference", function() {
			xit("requires the class name start with a capital letter");
			xit("requires that no special characters be present in the class name");
			xit("accepts '_' and '$' in the class name");
		});
		describe("invalid class names return null because", function() {
			xit("did not start with a capital letter");
			xit("contained executable scripts");
			xit("did not exist in the global object");
			xit("an error was thrown when attempting to get the class reference");
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
