# Hypodermic

Hypodermic is painless Dependency Injection for JavaScript. Really.

## Why Use Hypodermic for Dependency Injection?

Many JavaScript frameworks and libraries come with their own way of doing
dependency injection. Hypodermic does not seek to replace them, rather it was
built as a general purpose Dependency Injection and Inversion of Control
framework.

There is a lot of legacy code out there, so using a snazzy new framework that
supports Dependency Injection is not always possible. Hypodermic can fill this
void because it requires no outside dependencies, plus it works great when
building new frameworks.

## Features

- No outside dependencies are required
- Wire class and object dependencies together using an easy to read
  configuration format
- Define objects as singletons within the Container
- Inherit settings from parent configs
- Constructor, setter and property injection are all supported
- Create your own custom factory objects to churn out new instances
- Supports all major browsers

## Downloading Hypodermic

The official fork of Hypodermic is at: https://github.com/gburghardt/hypodermic

- [Download from GitHub](https://github.com/gburghardt/hypodermic/archive/master.zip)
- Install using Bower: `bower install hypodermic`

## Getting Started

It's easy to start using Hypodermic for dependency injection in your existing
web applications. First, you'll need DI-friendly code. After that, instantiate
`Hypodermic.Container` and pass in the configuration.

    var container = new Hypodermic.Container({
        foo: {
            type: "Object",
            properties: {
                xhr: "transport",
                url: { value: "/foo" },

            }
        },
        transport: {
            type: "XMLHttpRequest"
        }
    });

Now you can simply call `resolve` on the container, and pass in the name of the
object you want back:

    var foo = container.resolve("foo");

The call to `container.resolve("foo")` will return an object like the one below:

    {
        xhr: [object XMLHttpRequest],
        url: "/foo"
    }

The container performs these steps when getting an object named `foo`:

    var instance = new Object();
    instance.xhr = new XMLHttpRequest;
    instance.url = "/foo";

Any valid class name is supported, including namespaced classes.

## Property Injection

The easiest form of Dependency Injection is Property Injection, which you saw in
the previous example. Let's build upon this and create a class called `Point`,
which holds an x,y coordinate.

    function Point() {}

    Point.prototype.x = 0;
    Point.prototype.y = 0;

Now let's configure Hypodermic to give us a new `Point` object, setting the `x`
and `y` properties using Property Injection:

    var container = new Hypodermic.Container({
        point: {
            type: "Point",
            properties: {
                x: { value: 30 },
                y: { value: -8 }
            }
        }
    });

    var point = container.resolve("point");

Hypodermic essentially runs these JavaScript commands:

    var instance = new Point();
    instance.x = 30;
    instance.y = -8;

Next, we'll explore how to use Setter Injection.

## Setter Injection

Let's alter our `Point` class for Setter Injection with Hypodermic.

    function Point() {}

    Point.prototype.x = 0;
    Point.prototype.y = 0;

    Point.prototype.setX = function(value) {
        this.x = value;
    };

    Point.prototype.setY = function(value) {
        this.y = value;
    };

Hypodermic uses camelCase notation to auto generate a setter method name based
on the name of the property, so `foo` becomes `setFoo`. No other changes are
necessary in order to use Setter Injection. We can reuse the same Hypodermic
config from the previous example with no changes:

    var container = new Hypodermic.Container({
        point: {
            type: "Point",
            properties: {
                x: { value: 30 },
                y: { value: -8 }
            }
        }
    });

    var point = container.resolve("point");

Hypodermic runs these JavaScript commands:

    var instance = new Point();
    instance.setX(30);
    instance.setY(-8);

Now let's explore Constructor Injection.

## Constructor Injection

Sometimes you need your dependencies upon instantiation of an object. Hypodermic
supports full Constructor Injection to assist in these scenarios. Let's build on
our previous example and alter our `Point` class to accept an `x` and `y` value
in the constructor.

    function Point(x, y) {
        if (typeof x === "number")
            this.x = x;

        if (typeof y === "number")
            this.y = y;
    }

    Point.prototype.x = 0;
    Point.prototype.y = 0;

    Point.prototype.setX = function(value) {
        this.x = value;
    };

    Point.prototype.setY = function(value) {
        this.y = value;
    };

We have to change the Hypodermic configuration a little to pass the `x` and `y`
values into the `Point` constructor:

    var container = new Hypodermic.Container({
        point: {
            type: "Point",
            constructorArgs: [
                { value: 30 },
                { value: -8 }
            ]
        }
    });

    var point = container.resolve("point");

Notice that `constructorArgs` is an Array. The values in the Array are passed in
their same positions to the constructor. Now Hypodermic runs the equivalent of
this code:

    var instance = new Point(30, -8);

## Mixing Dependency Injection Types

You are not restricted to one type of Dependency Injection for each class. You
can mix and match to your heart's content.

First, let's define our class:

    function Point3d(x) {
        if (typeof x === "number")
            this.x = x;
    }

    Point3d.prototype.x = 0;
    Point3d.prototype.y = 0;
    Point3d.prototype.z = 0;

    Point3d.prototype.setY = function(value) {
        this.y = value;
    };

Now the Hypodermic configuration that performs all three kinds of dependency
injection on the new instance of `Point3d`:

    var container = new Hypodermic.Container({
        point: {
            type: "Point3d",
            constructorArgs: [
                { value: 32 }
            ],
            properties: {
                y: { value: -9 },
                z: { value: 157 }
            }
        }
    });

Now Hypodermic uses these commands:

    var instance = new Point3d(32);
    instance.setY(-9);
    instance.z = 157;

So far we've just been injecting primative JavaScript values into our classes,
but this doesn't give us the true benefits of Inversion of Control. We'll
explore how to do this next.

## Wiring Dependencies Together

Each object in the Container is given a name. By default, each call to `resolve`
will return a new object. Let's explore how we can wire two objects together.

First, we'll create an example class in JavaScript to manage a task list. The
items in each task list are selectable, so we will create a class allowing you
to select and deselect task list items.

    function TaskListController() {}

    TaskListController.prototype.selection = null;

    function SelectionController() {}

We will forego the actual implementation in order to highlight how Hypodermic
can wire these two classes together:

    var container = new Hypodermic.Container({
        taskList: {
            type: "TaskListController",
            properties: {
                selection: "selectableList"
            }
        },
        selectableList: {
            type: "SelectionController"
        }
    });

    var taskList = container.resolve("taskList");

We have two types registered with Hypodermic: `taskList`, which will be an
instance of `TaskListController`, and `selectableList` which will be an instance
of `SelectionController`. In the `properties` of the taskList configuration, we
will create a new `SelectionController` and use Property Injection to give the
task list a reference to this object. Let's explore the steps that Hypodermic
takes when resolving the "taskList" object:

    var instance = new TaskListController();
    instance.selection = new SelectionController();

That's it! Nothing more on your end is needed.

### Wiring Together Native Types

Any native type in JavaScript is supported, providing you have a configuration
for it:

    var container = new Hypodermic.Container({
        tasks: {
            type: "Object",
            properties: {
                transport: "xhr",
                items: "taskItems",
                config: "taskConfig"
            }
        },
        taskConfig: {
            type: "Object",
            properties: {
                url: { value: "/tasks" }
            }
        },
        taskItems: {
            type: "Array"
        },
        xhr: {
            type: "XMLHttpRequest"
        }
    });

    var tasks = container.resolve("tasks");

Now you'll get back an `Object` with three properties. Hypodermic did this under
the hood:

    var tasks = new Object();
    tasks.transport = new XMLHttpRequest();
    tasks.items = new Array();
    tasks.config = new Object();
    tasks.config.url = "/tasks";

## Sharing Object Instances Using Singletons

There are times when you don't want to generate a new object for each dependency
in your application. Sometimes you want a shared dependency. One example is event
publishing. Defining Hypodermic configurations as a `singleton` causes each call
to `resolve` to return the same object instance for a given name. Let's dive in
to our event publishing example.

First, let's create our event dispatcher. A simple implementation has been
created below:

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

Now we have two other classes that need access to the same instance of
`Dispatcher` so that they can communicate.

We define our `TaskListController` class, which has a `dispatcher` property.
When the `add` method is called, `TaskListController` will publish an event
called "tasks.added".

    function TaskListController() {
        this.tasks = [];
    }

    TaskListController.prototype.dispatcher = null;

    TaskListController.prototype.add = function(task) {
        this.tasks.push(task);
        this.dispatcher.publish("tasks.added", this, task);
    };

The `RecentlyAddedTasksController` class subscribes to the "tasks.added" event.
It needs a reference to the same exact object instance of `Dispatcher` that
`TaskListController` has so it can respond:

    function RecentlyAddedTasksController(dispatcher) {
        this.dispatcher = dispatcher;
        this.dispatcher.subscribe("tasks.added", this.handleTaskAdded, this);
    }

    RecentlyAddedTasksController.prototype.dispatcher = null;

    RecentlyAddedTasksController.prototype.handleTaskAdded = function(publisher, task) {
        alert("A task was added! " + task);
    };

Now let's use Hypodermic to wire these three classes together:

    var container = new Hypodermic.Container({
        tasks: {
            type: "TaskListController",
            properties: {
                dispatcher: "eventDispatcher"
            }
        },
        recentTasks: {
            type: "RecentlyAddedTasksController",
            constructorArgs: [
                "eventDispatcher"
            ]
        },
        eventDispatcher: {
            type: "Dispatcher",
            singleton: true
        }
    });

We see that the object called `tasks` holds a property called `dispatcher`. The
value of this property is then fetched from the container, and the configuration
called "eventDispatcher" is used to create this object. The `recentTasks` object
receives a dependency called "eventDispatcher" as the first argument to its
constructor. The key to this is the definition of `eventDispatcher` in the
container: `singleton: true`

Since the `eventDispatcher` dependency specifies `singleton: true`, every call
to `container.resolve("eventDispatcher")` returns the same exact instance of
`Dispatcher`. That means the TaskListController __and__
RecentlyAddedTasksController both reference the same event dispatcher.

Now, let's get references to our controllers:

    var tasks = container.resolve("tasks");
    var recentTasks = container.resolve("recentTasks");

Let's see what Hypodermic is doing under the hood:

    var tasks = new TaskListController();
    var dispatcher = new Dispatcher();

    tasks.dispatcher = dispatcher;

    var recentTasks = new RecentlyAddedTasksController(dispatcher);

Since the "eventDispatcher" was defined as a singleton in this container,
Hypodermic stashes a reference to that object and passes it to anyone who
requests an "eventDispatcher" dependency!

Now running the code:

    tasks.add("Take out the garbage");

Should alert:

> A task was added! Take out the garbage

## Custom Object Factories

Hypodermic comes with its own general purpose object factory called
`Hypodermic.ObjectFactory`. This will suffice for most cases, but once in a
while you will want to create your own object factory to resolve a dependency.

At its most basic level, a custom object factory in Hypodermic is just another
dependency in your configs, with a few special features. Let's start with an
easy example:

    var container = new Hypodermic.Container({
        pointFactory: {
            type: "PointFactory",
            singleton: true
        },
        point2d: {
            factory: {
                id: "pointFactory"
                type: "2d"
            }
        },
        point3d: {
            factory: {
                id: "pointFactory"
                type: "3d"
            }
        }
    });

Now the implementation of `PointFactory`:

    function PointFactory() {}

    PointFactory.prototype.createInstance = function(type) {
        switch (type) {
            case "2d":
                return new Point();
            case "3d":
                return new Point3d();
            default:
                throw new Error("Invalid type: " + type);
        }
    }

Now calling `resolve` will invoke `createInstance` on the PointFactory.

    var p1 = container.resolve("point2d"),
        p2 = container.resolve("point3d");

What Hypodermic is doing under the hood:

    var factory = new PointFactory();

    var p1 = factory.createInstance("2d");

    var p2 = factory.createInstance("3d");

Related demo: `demo/custom_factory.html`

You can get a little crazier with your factory and utilize full dependency
injection to create the arguments to your factory:

    logger: {
        type: "window.console",
        singleton: true
    },
    point2d: {
        factory: {
            id: "pointFactory",
            args: [
                { value: "2d" },
                { value: 90 },
                { value: 10 },
                { value: null },
                "logger"
            ]
        }
    },

Now let's change PointFactory:

    PointFactory.prototype.createInstance = function(type, x, y, z, logger) {
        logger.info("Create new point of type: " + type);

        switch (type) {
            case "2d":
                return new Point(x, y);
            case "3d":
                return new Point3d(x, y, z);
            default:
                throw new Error("Invalid type: " + type);
        }
    }

Calling `container.resolve("point2d")` will give back a `Point` object whose `x`
and `y` properties are `90` and `10` respectively. Plus, a `logger` object is
passed as the last argument to `createInstance`, which spits out a message to
the browser console.

The values of the `args` Array can be anything you would put in the
`constructorArgs` Array, throwing the full weight of Hypodermic behind your
custom object factory.

Related demo: `demo/custom_factory_args.html`

### Changing The Method Name For A Custom Object Factory

You are not cemented in to using `createInstance` as the method name for custom
object factories. In the dependency config, use the `method` property to change
the factory method name into anything you want:

    point2d: {
        factory: {
            id: "pointFactory",
            method: "createPoint",
            args: [
                { value: "2d" },
                { value: 90 },
                { value: 10 },
                { value: null },
                "logger"
            ]
        }
    },

    ...

    PointFactory.prototype.createPoint = function(type, x, y, z, logger) {
        ...
    };

### Using The Reserved `document` Configuration As A Factory

Later on we'll discuss reserved configuration names in Hypodermic. The
`document` name refers to the document object in web browsers:

    container.resolve("document") === document // true

This means you can use the `document` object as a custom factory!

    var container = new Hypodermic.Container({
        div: {
            factory: {
                id: "document",
                method: "createElement",
                type: "div"
            }
        },
        foo: {
            type: "Object",
            properties: {
                element: "div"
            }
        }
    });

    var div = container.resolve("div");

    var foo = container.resolve("foo");

    foo.element // [object HTMLDivElement]

And it doesn't stop there. Use Hypodermic to grab DOM nodes too when resolving
dependencies!

    var container = new Hypodermic.Container({
        paragraphs: {
            factory: {
                id: "document",
                method: "querySelectorAll",
                type: "p"
            }
        }
    });

    var elements = container.resolve("paragraphs");

    elements // [object NodeList<HTMLParagraphElement>]

## DRY-ing Up Your Hypodermic Configuration

You'll have cases where multiple classes require the same dependency, and
suddenly your Hypodermic configuration becomes a tangled mess of repeated code.
Yuck!

    var container = new Hypodermic.Container({
        foo: {
            type: "Object",
            properties: {
                url: { value: "/foo" },
                config: "globalConfig"
            }
        },
        bar: {
            type: "Object",
            properties: {
                x: { value: 42 },
                config: "globalConfig"
            }
        },
        globalConfig: {
            type: "Object",
            singleton: true
        }
    });

Here we see that both "foo" and "bar" have a shared dependency called "config",
which references a singleton object called "globalConfig". Let's DRY up this
configuration a little:

    var container = new Hypodermic.Container({
        configurable: {
            template: true,
            properties: {
                config: "globalConfig"
            }
        },
        foo: {
            type: "Object",
            parent: "configurable",
            properties: {
                url: { value: "/foo" }
            }
        },
        bar: {
            type: "Object",
            parent: "configurable",
            properties: {
                x: { value: 42 }
            }
        },
        globalConfig: {
            type: "Object",
            singleton: true
        }
    });

We've moved the global config object into a __template configuration__ called
"configurable". The parent configuration for both "foo" and "bar" is
"configurable", so they both receive the same config property without having to
specify it twice.

## Reserved Configuration Names

There are two configuration names that are reserved for special use: `container`
and `global`.

- `container`: This allows you to inject the instance of `Hypodermic.Container`
  into any object configured for that container.
- `global`: This allows you to inject the `window` object into a dependency. In
  the future when non browser executing environments are supported, this will
  inject the global context.

The following configuration names are reserved in Web Browser execution
environments:

- `applicationCache`: The applicationCache object in HTML5 capable browsers
- `console`: The native browser logging console
- `document`: The document object for the current page
- `localStorage`: The localStorage object in compatible browsers
- `location`: The window.location object
- `navigator`: The browser navigator object
- `screen`: The browser screen object
- `sessionStorage`: The session storage object in HTML5 capable browsers

Example:

    function Universe() {}

    Universe.prototype.window = null;
    Universe.prototype.container = null;

    var container = new Hypodermic.Container({
        everything: {
            type: "Universe",
            properties: {
                container: "container",
                window: "global"
            }
        }
    });

    var everything = container.resolve("everything");

    everything.window === window       // true
    everything.container === container // true

    container.resolve("document") === document // true

## What's Next?

View the demo in `demo/index.html`.

## Reporting Bugs and Contributing Code

If you find a problem with Hypodermic, open up an
[Issue on GitHub](https://github.com/gburghardt/hypodermic/issues).

If you would like to contribute, simply
[fork this repository](https://github.com/gburghardt/hypodermic). Create a
branch for your new feature, build it, test it and push it to GitHub. Lastly,
submit a [pull request](https://github.com/gburghardt/hypodermic/pulls)
outlining the new feature or bug fix.

## Future Development

Hypodermic is still under development, with new features on the horizon.

### Support For Non Browser Environments

As of right now, only browser execution environments are supported, however
support for these environments will be added:

- NodeJS
- Rhino

If you know of a non browser environment not on this list, please open an
[Issue on GitHub](https://github.com/gburghardt/hypodermic/issues), or fork this
repository and submit a pull request.

### Integration With A Dynamic Asset Loader

Since all of your dependencies are wired together, it would be nice to build an
asset loading layer on top of the container.

- Resolving a dependency becomes asynchronous
- JavaScript, CSS and images are downloaded on demand
- Support for RequireJS
- Support for minified versions of files
- Support for plain old JavaScript

Some pseudo code:

    var container = new Hypodermic.DynamicAssetLoader(config);

    container.resolve("foo")
        .then(function(dependency) {
            // do something
        });

The asset loader would support the same basic interface as
`Hypodermic.Container` but it would return a Promise instead of the dependency.