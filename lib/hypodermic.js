/**
 * class Hypodermic < Object
 *
 * This class provides basic dependency injection for JavaScript and is a
 * light weight object factory as well.
 *
 * new Hypodermic([configs])
 * - configs (Object): Optional configs for this object factory.
 **/
function Hypodermic(configs) {
	configs = configs || {};

	configs[this.constructor.me] = {
		className: this.constructor.className,
		singleton: true
	};

	this._configs = configs;
	this._singletons = {};
	this._singletons[this.constructor.me] = this;
	this._classReferenceCache = {};
	configs = null;
}

/**
 * Hypodermic.me -> String
 * 
 * The name of the singleton config Id so objects can be injected with a
 * reference to this object factory.
 **/
Hypodermic.me = "hypodermic";

/**
 * Hypodermic.className -> String
 *
 * The name of this class.
 **/
Hypodermic.className = "Hypodermic";

Hypodermic.prototype = {

	/**
	 * Hypodermic#_classCache -> Object
	 * 
	 * Key-value pairs associating a string class name with its constructor
	 * function to avoid costly lookups.
	 **/
	_classCache: null,

	/**
	 * Hypodermic#_configs -> Object
	 * 
	 * The configs defining the objects this factory can generate, and their
	 * dependencies.
	 **/
	_configs: null,

	/**
	 * Hypodermic#_singletons -> Object
	 * 
	 * References to objects that are singletons in this object factory.
	 **/
	_singletons: null,

	/**
	 * Hypodermic#destructor()
	 * 
	 * Ready this object factory for garbage collection.
	 **/
	destructor: function() {
		this._destroySingletons();
		this.configs = this.classReferenceCache = null;
	},

	_destroySingletons: function() {
		for (var id in this.singletons) {
			if (!this.singletons.hasOwnProperty(id)) { continue; }
			this.singletons[ id ] = null;
		}

		this.singletons = null;
	},

	_capitalize: function(str) {
		return str.charAt(0).toUpperCase() + str.substring(1, str.length);
	},

	_createInstanceFromConfig: function(id, config) {
		var instance = null;
		var Klass = this._getClassReference(config.className);
		var ProxyClass = null;
		var constructorArgs = null;
		var parentConf = null;

		if (!Klass) {
			return instance;
		}

		// instance is to be created from constructor function

		if (config.constructorArgs) {
			ProxyClass = function() {};
			ProxyClass.prototype = Klass.prototype;

			instance = new ProxyClass();
			constructorArgs = this._getConstructorArgs(config.constructorArgs);
			Klass.apply(instance, constructorArgs);
		}
		else {
			instance = new Klass();
		}

		// inject properties from parent configs
		if (config.parent) {
			parentConf = this._configs[config.parent];

			while (parentConf) {
				if (parentConf.properties) {
					this._injectDependencies(instance, parentConf.properties);
				}

				parentConf = this._configs[parentConf.parent] || null;
			}
		}

		// inject properties for this instance as overrides
		if (config.properties) {
			this._injectDependencies(instance, config.properties);
		}

		ProxyClass = null;
		Klass = null;
		config = null;
		parentConf = null;

		return instance;
	},

	_getClassReference: function(className) {
		var Klass = this._classCache[className] || null;

		if (!Klass && /^[A-Z][\w+.]$/.test(className)) {
			Klass = eval(className);
		}

		return Klass;
	},

	_getConstructorArgs: function(constructorArgsConfig) {
		var constructorArgs = [];

		for (var i = 0, length = constructorArgsConfig.length; i < length; i++) {
			constructorArgs.push(this._getDependencyValue(constructorArgsConfig[i]));
		}

		return constructorArgs;
	},

	_getDependencyValue: function(propertyConfig) {
		var value = null;

		if (propertyConfig.id) {
			value = this.getInstance(propertyConfig.id);
		}
		else if ( typeof propertyConfig.value !== "undefined" ) {
			value = propertyConfig.value;
		}
		else {
			value = null;
		}

		propertyConfig = null;

		return value;
	},

	/**
	 * Hypodermic#getInstance(id) -> Object | null
	 * - id (String): The Id of the config to use to generate this new object
	 *
	 * Get an instance of an object from this object factory. If the id is not
	 * found, then null is returned;
	 **/
	getInstance: function(id) {
		var config = this._configs[id];
		var instance = null;

		if (!config) {
			instance = null;
		}
		else if (config.singleton) {
			instance = this._getSingletonInstance(id, config);
		}
		else if (!config.abstract) {
			instance = this._createInstanceFromConfig(id, config);
		}
		else {
			throw new Error("Cannot instantiate an object from abstract config \"" + id + "\"");
		}

		return instance;
	},

	_getSingletonInstance: function(id, config) {
		var instance = null;

		if (this._singletons[id]) {
			instance = this._singletons[id];
		}
		else {
			instance = this._createInstanceFromConfig(id, config);
			this._singletons[id] = instance;
		}

		return instance;
	},

	_injectDependencies: function(instance, properties) {
		var setterName = "";
		var adderName = "";
		var name = "";
		var value = null;

		for (name in properties) {
			if (!properties.hasOwnProperty(name)) { continue; }

			value = this._getDependencyValue(properties[name]);
			setterName = "set" + this._capitalize(name);
			adderName = "add" + this._capitalize(name);

			if (this.isFunction(instance[setterName])) {
				// inject foo property via setFoo()
				instance[setterName](value);
			}
			else if (this.isFunction(instance[adderName])) {
				// inject foo property via addFoo()
				instance[adderName](value);
			}
			else {
				// inject foo via property name
				instance[name] = value;
			}
		}

		properties = instance = value = null;
	},

	_isArray: function(x) {
		return (x instanceof Array) ? true : false;
	},

	_isFunction: function(x) {
		return (Object.prototype.toString.call(x) === "[object Function]") ? true : false;
	},

	_isObject: function( x ) {
		return (typeof x === "object" && x !== null) ? true : false;
	},

	/**
	 * Hypodermic#setConfigs(configs)
	 * - configs (Object): New object configs to add
	 *
	 * Add object configs to this factory.
	 **/
	setConfigs: function(configs) {
		for (var id in configs) {
			if (!configs.hasOwnProperty(id)) { continue; }

			this._configs[id] = configs[id];
		}

		configs = null;
	}

};

Hypodermic.prototype.constructor = Hypodermic;