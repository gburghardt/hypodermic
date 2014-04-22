function Dispatcher() {
	this.subscribers = {};
}

Dispatcher.prototype.publish = function(eventName, publisher, data) {
	var subscribers = this.subscribers[eventName],
		subscriber, result;

	if (!subscribers)
		return;

	for (var i = 0, length = subscribers.length; i < length; i++) {
		subscriber = subscribers[i];
		result = subscriber.method.call(subscriber.context, publisher, data);

		if (result === false)
			break;
	}
};

Dispatcher.prototype.subscribe = function(eventName, method, context) {
	this.subscribers[eventName] = this.subscribers[eventName] || [];
	this.subscribers[eventName].push({
		method: method,
		context: context || null
	});
};
