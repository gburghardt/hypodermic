(function(global) {

function ObjectFactory(container, dependencyResolver) {
	this.container = container;
	this.dependencyResolver = dependencyResolver;
}

ObjectFactory.prototype = {

	container: null,

	dependencyResolver: null,

	constructor: ObjectFactory,

	createInstance: function(config, constructorDependencies) {
		if (!config.type) {
			throw new Error("Missing required argument: config.type");
		}

		var Klass = this._getClassReference(config.type),
		    instance = null,
		    args = null;

		if (!Klass) {
			throw new Error("Class " + config.type + " not found.");
		}
		else if (Klass.constructor === Function) {
			instance = Object.create(Klass.prototype);

			if (constructorDependencies) {
				args = this._getConstructorArgs(constructorDependencies);
				Klass.apply(instance, args);
			}
			else {
				Klass.call(instance);
			}
		}
		else {
			// object singleton/static class
			instance = Klass;
		}

		return instance;
	},

	createInstanceFromFactory: function(config) {
		if (!config.factory.id) {
			throw new Error("Missing required argument: config.factory.id");
		}

		var factoryInfo = config.factory,
		    factory = this.container.resolve(factoryInfo.id, true),
		    method = factoryInfo.method || "createInstance",
		    args = [], dependency, i, length;

		if (factoryInfo.args && factoryInfo.args.length) {
			for (i = 0, length = factoryInfo.args.length; i < length; i++) {
				args.push(this.dependencyResolver.findDependency(factoryInfo.args[i]));
			}
		}
		else {
			args.push(factoryInfo.type);
		}

		if (!factory[method]) {
			throw new Error("No method called " + method + " exists on the factory object registered as " + factoryInfo.id);
		}

		dependency = factory[method].apply(factory, args);

		return dependency;
	},

	_getClassReference: function(className) {
		var Klass = _classCache[className] || null;

		if (!Klass && /^[a-zA-Z][\w.$]+$/.test(className)) {
			try {
				Klass = global.eval(className);
			}
			catch (error) {
				Klass = null;
			}
		}

		if (Klass) {
			_classCache[className] = Klass;
		}

		return Klass;
	},

	_getConstructorArgs: function(dependencies) {
		var args = [];

		for (var i = 0, length = dependencies.length; i < length; i++) {
			args.push(this.dependencyResolver.findDependency(dependencies[i]));
		}

		return args;
	}

};

global.Hypodermic.ObjectFactory = ObjectFactory;

// Seed the class cache with some defaults
var _classCache = {};

var conditionalClasses = [
	"Array",
	"Boolean",
	"Date",
	"document",
	"DocumentFragment",
	"DOMParser",
	"Error",
	"FileReader",
	"Function",
	"location",
	"navigator",
	"Number",
	"Object",
	"RegExp",
	"String",
	"XMLHttpRequest"
];

var i, length, x;

for (i = 0, length = conditionalClasses.length; i < length; i++) {
	x = conditionalClasses[i];

	if (global[x] !== undefined) {
		_classCache[x] = global[x];
	}
}

})(this);
