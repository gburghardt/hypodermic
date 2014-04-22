(function(global) {

var globals = [
	"applicationCache",
	"console",
	"document",
	"localStorage",
	"location",
	"navigator",
	"screen",
	"sessionStorage"
], globalSingletons = { global: global };

for (var i = 0, key, length = globals.length; i < length; i++) {
	key = globals[i];

	if (key in global) {
		globalSingletons[key] = global[key];
	}
}

function Container(_configs) {

	if (!_configs) {
		throw new Error("Missing required argument: configs");
	}

	var _dependencyResolver = new Hypodermic.DependencyResolver(this),
	    _objectFactory = new Hypodermic.ObjectFactory(this, _dependencyResolver),
	    _singletons = Object.create(globalSingletons);

	_singletons.container = this;

	this.resolve = function(name, unsafe) {
		var instance = null,
		    config = _configs[name],
		    propertiesSet = {};

		if (_singletons[name]) {
			instance = _singletons[name];
		}
		else if (!config) {
			if (unsafe) {
				throw new Error("No configuration found for " + name);
			}
		}
		else if (config.abstract) {
			throw new Error("Cannot create resolve abstract config: " + name);
		}
		else {
			if (config.factory) {
				instance = _objectFactory.createInstanceFromFactory(config);
			}
			else {
				instance = _objectFactory.createInstance(config, config.constructorArgs);
			}

			if (config.singleton) {
				_singletons[name] = instance;
			}

			_dependencyResolver.injectDependencies(instance, config, propertiesSet);

			while (config = _configs[config.parent]) {
				_dependencyResolver.injectDependencies(instance, config, propertiesSet);
			}
		}

		return instance;
	};
}

global.Hypodermic.Container = Container;

})(this);
