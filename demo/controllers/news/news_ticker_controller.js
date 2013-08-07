window.News = window.News || {};

News.NewsTickerController = function(config) {
	this.config = config;
};

News.NewsTickerController.prototype = {
	config: null,
	element: null,
	method: "GET",
	retries: 0,
	selector: ".news-ticker",
	title: "",
	transport: null,
	url: null,

	init: function(element) {
		this.element = element.querySelector(this.selector);
		this.getLatestNews();
	},

	getLatestNews: function() {
		if (this.retries < this.config["polling.retries"]) {
			this.transport.open(this.method, this.url + "?" + new Date().getTime(), true);
			this.transport.onreadystatechange = function() {
				if (this.transport.readyState !== 4 || this.transport.status !== 200) {
					return;
				}

				this.element.innerHTML = "<h1>" + this.title + "</h1><p>" + "Updated at: " + new Date() + "</p>" + this.transport.responseText;

				setTimeout(this.getLatestNews.bind(this), this.config["polling.interval"]);
			}.bind(this);

			this.transport.send(null);
		}
	}
};