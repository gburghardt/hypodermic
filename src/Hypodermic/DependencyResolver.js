(function (global) {

function DependencyResolver(container) {
	this.container = container;
}

DependencyResolver.prototype = {

	container: null,

	constructor: DependencyResolver,

	findDependency: function(info) {
		var instance = null, factory;

		if (isString(info)) {
			instance = this.container.resolve(info, true);
		}
		else if ("value" in info) {
			instance = info.value;
		}
		else {
			throw new Error("No dependency value found. Missing one of 'id', 'value' or 'factory'");
		}

		return instance;
	},

	injectDependencies: function(instance, config, propertiesSet) {
		if (!config.properties) {
			return;
		}

		var properties = config.properties,
		    key, dependency, setter;

		for (key in properties) {
			if (properties.hasOwnProperty(key) && !propertiesSet[key]) {
				setter = "set" + capitalize(key);
				dependency = this.findDependency(properties[key]);

				if (isFunction(instance[setter])) {
					instance[setter](dependency);
				}
				else {
					instance[key] = dependency;
				}

				propertiesSet[key] = true;
			}
		}
	}

};

global.Hypodermic.DependencyResolver = DependencyResolver;

// utils

var toString = Object.prototype.toString;

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.substring(1, str.length);
}

function isFunction(x) {
	return toString.call(x) === "[object Function]";
}

function isString(x) {
	return toString.call(x) === "[object String]";
}

})(this);
