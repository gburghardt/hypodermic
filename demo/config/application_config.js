var applicationConfig = {
	config: {
			className: "Object",
			singleton: true,
			properties: {
			"polling.interval": { value: 1800 },
			"polling.retries": { value: 5 },
			messageLimit: { value: 3 }
		}
	},

	main: {
		className: "Application",
		constructorArgs: [
			{ id: "config" }
		],
		properties: {
			objectFactory: { id: "objectFactory" },
			headlineNewsTicker: { id: "headlinesNewsTicker" },
			nationalNewsTicker: { id: "nationalNewsTicker" }
		}
	},

	transport: {
		className: "XMLHttpRequest"
	},

	newsTicker: {
		abstract: true,
		properties: {
			transport: { id: "transport" }
		}
	},

	headlinesNewsTicker: {
		className: "News.NewsTickerController",
		parent: "newsTicker",
		constructorArgs: [
			{ id: "config" }
		],
		properties: {
			title: { value: "Latest Headlines" },
			selector: { value: ".news-ticker-headlines" },
			url: { value: "./news/headlines.html" }
		}
	},

	nationalNewsTicker: {
		className: "News.NewsTickerController",
		parent: "newsTicker",
		constructorArgs: [
			{ id: "config" }
		],
		properties: {
			title: { value: "National Headlines" },
			selector: { value: ".news-ticker-national" },
			url: { value: "./news/national.html" }
		}
	}
};