function RecentTasksController() {
}

RecentTasksController.prototype = {

	dispatcher: null,

	list: null,

	constructor: RecentTasksController,

	init: function(list) {
		this.list = list;
		this.dispatcher.subscribe("task.added", this.handleTaskAdded, this);
	},

	handleTaskAdded: function(publisher, task) {
		var item = document.createElement("li");
		item.innerHTML = task;
		this.list.appendChild(item);
	}

};