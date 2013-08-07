function Application(config) {
	this.config = config;
}

Application.prototype = {
	config: null,
	element: null,
	objectFactory: null,
	headlineNewsTicker: null,
	nationalNewsTicker: null,

	init: function(element) {
		this.element = element;
		this.headlineNewsTicker.init(this.element);
		this.nationalNewsTicker.init(this.element);
	},

	setHeadlineNewsTicker: function(headlineNewsTicker) {
		this.headlineNewsTicker = headlineNewsTicker;
	}
};