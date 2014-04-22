describe("Hypodermic.DependencyResolver", function() {

	var resolver, container = {
		resolve: function() {}
	};

	beforeEach(function() {
		resolver = new Hypodermic.DependencyResolver(container);
	});

	describe("findDependency", function() {

		it("returns a named object from the container", function() {
			var info = "test";
			var dependency = {};
			spyOn(container, "resolve").and.returnValue(dependency);

			var x = resolver.findDependency(info);

			expect(container.resolve).toHaveBeenCalledWith("test", true);
			expect(x).toBe(dependency);
		});

		it("returns a raw value", function() {
			var info = {
				value: 100
			};

			var x = resolver.findDependency(info);

			expect(x).toBe(100);
		});

		it("throws an error if no id, value or factory exists", function() {
			expect(function() {
				resolver.findDependency({});
			}).toThrowError("No dependency value found. Missing one of 'id', 'value' or 'factory'");
		});

	});

	describe("injectDependencies", function() {

		it("does nothing if the config is missing a 'properties' key", function() {
			var instance = { foo: null };
			var config = {};
			var propertiesSet = {};

			resolver.injectDependencies(instance, config, propertiesSet);

			expect(instance).toEqual({ foo: null });
		});

		it("does nothing if all properties have been previously set", function() {
			var instance = { x: 12, y: 2 };
			var config = {
				properties: {
					x: { value: 10 },
					y: { value: 32 }
				}
			};
			var propertiesSet = { x: true, y: true };

			resolver.injectDependencies(instance, config, propertiesSet);

			expect(instance).toEqual({x: 12, y: 2});
		});

		it("performs property injection", function() {
			var instance = { foo: null };
			var config = {
				properties: {
					foo: { value: 42 }
				}
			};
			var propertiesSet = {};

			resolver.injectDependencies(instance, config, propertiesSet);

			expect(instance).toEqual({ foo: 42 });
		});

		it("performs setter injection", function() {
			var instance = {
				value: null,

				setFoo: function(value) {
					this.value = value;
				}
			};
			var config = {
				properties: {
					foo: { value: 123 }
				}
			};
			var propertiesSet = {};

			resolver.injectDependencies(instance, config, propertiesSet);

			expect(instance.value).toBe(123);
		});

		it("does not overwrite properties with consecutive calls", function() {
			var instance = { foo: null };
			var config1 = {
				properties: {
					foo: { value: 42 }
				}
			};
			var config2 = {
				properties: {
					foo: { value: 85 }
				}
			};
			var propertiesSet = {};

			resolver.injectDependencies(instance, config1, propertiesSet);
			resolver.injectDependencies(instance, config2, propertiesSet);

			expect(instance.foo).toBe(42);
			expect(propertiesSet).toEqual({ foo: true });
		});

	});

});
