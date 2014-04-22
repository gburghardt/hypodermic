function TasksController() {
	this.add = this.add.bind(this);
}

TasksController.prototype = {

	dispatcher: null,

	form: null,

	constructor: TasksController,

	init: function(form) {
		this.form = form;
		this.form.addEventListener("submit", this.add, false);
	},

	add: function(event) {
		event = event || window.event;
		event.preventDefault();

		var input = this.form.elements.task,
		    task = input.value;

		if (/^\s*$/.test(task)) {
			alert("Please enter a task");
		}
		else {
			this.dispatcher.publish("task.added", this, task);
		}

		input.value = "";
		input.focus();
	}

};