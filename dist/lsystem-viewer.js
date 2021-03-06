(function () {

if (typeof Element === "undefined" || "classList" in document.documentElement) return;

var indexOf = [].indexOf,
    slice = [].slice,
    push = [].push,
    splice = [].splice,
    join = [].join;

function DOMTokenList(el) {  
  this._element = el;
  if (el.className != this.classCache) {
    this._classCache = el.className;
    
    var classes = this._classCache.split(' '),
        i;
    for (i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }
};

function setToClassName(el, classes) {
  el.className = classes.join(' ');
}

DOMTokenList.prototype = {
  add: function(token) {
    push.call(this, token);
    setToClassName(this._element, slice.call(this, 0));
  },
  contains: function(token) {
    return indexOf.call(this, token) !== -1;
  },
  item: function(index) {
    return this[index] || null;
  },
  remove: function(token) {
    var i = indexOf.call(this, token);
     if (i === -1) {
       return;
     }
    splice.call(this, i, 1);
    setToClassName(this._element, slice.call(this, 0));
  },
  toString: function() {
    return join.call(this, ' ');
  },
  toggle: function(token) {
    if (indexOf.call(this, token) === -1) {
      this.add(token);
    } else {
      this.remove(token);
    }
  }
};

window.DOMTokenList = DOMTokenList;

function defineElementGetter (obj, prop, getter) {
	if (Object.defineProperty) {
		Object.defineProperty(obj, prop,{
			get : getter
		})
	} else {					
		obj.__defineGetter__(prop, getter);
	}
}

defineElementGetter(Element.prototype, 'classList', function () {
  return new DOMTokenList(this);			
});

})();
;// Copyright 2009-2012 by contributors, MIT License
// vim: ts=4 sts=4 sw=4 expandtab

// Module systems magic dance
(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(definition);
    // YUI3
    } else if (typeof YUI == "function") {
        YUI.add("es5-sham", definition);
    // CommonJS and <script>
    } else {
        definition();
    }
})(function () {


var call = Function.prototype.call;
var prototypeOfObject = Object.prototype;
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

// ES5 15.2.3.2
// http://es5.github.com/#x15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/kriskowal/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    Object.getPrototypeOf = function getPrototypeOf(object) {
        return object.__proto__ || (
            object.constructor
                ? object.constructor.prototype
                : prototypeOfObject
        );
    };
}

// ES5 15.2.3.3
// http://es5.github.com/#x15.2.3.3
if (!Object.getOwnPropertyDescriptor) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a non-object: ";

    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object != "object" && typeof object != "function") || object === null) {
            throw new TypeError(ERR_NON_OBJECT + object);
        }
        // If object does not owns property return undefined immediately.
        if (!owns(object, property)) {
            return;
        }

        // If object has a property then it's for sure both `enumerable` and
        // `configurable`.
        var descriptor =  { enumerable: true, configurable: true };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            object.__proto__ = prototypeOfObject;

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            // Once we have getter and setter we can put values back.
            object.__proto__ = prototype;

            if (getter || setter) {
                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }
                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        return descriptor;
    };
}

// ES5 15.2.3.4
// http://es5.github.com/#x15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = Object.prototype.__proto__ === null;
    if (supportsProto || typeof document == 'undefined') {
        createEmpty = function () {
            return { "__proto__": null };
        };
    } else {
        // In old IE __proto__ can't be used to manually set `null`, nor does
        // any other method exist to make an object that inherits from nothing,
        // aside from Object.prototype itself. Instead, create a new global
        // object and *steal* its Object.prototype and strip it bare. This is
        // used as the prototype to create nullary objects.
        createEmpty = (function () {
            var iframe = document.createElement('iframe');
            var parent = document.body || document.documentElement;
            iframe.style.display = 'none';
            parent.appendChild(iframe);
            iframe.src = 'javascript:';
            var empty = iframe.contentWindow.Object.prototype;
            parent.removeChild(iframe);
            iframe = null;
            delete empty.constructor;
            delete empty.hasOwnProperty;
            delete empty.propertyIsEnumerable;
            delete empty.isPrototypeOf;
            delete empty.toLocaleString;
            delete empty.toString;
            delete empty.valueOf;
            empty.__proto__ = null;

            function Empty() {}
            Empty.prototype = empty;

            return function () {
                return new Empty();
            };
        })();
    }

    Object.create = function create(prototype, properties) {

        var object;
        function Type() {}  // An empty constructor.

        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype !== "object" && typeof prototype !== "function") {
                // In the native implementation `parent` can be `null`
                // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                // like they are in modern browsers. Using `Object.create` on DOM elements
                // is...err...probably inappropriate, but the native version allows for it.
                throw new TypeError("Object prototype may only be an Object or null"); // same msg as Chrome
            }
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            object.__proto__ = prototype;
        }

        if (properties !== void 0) {
            Object.defineProperties(object, properties);
        }

        return object;
    };
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/kriskowal/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, "sentinel", {});
        return "sentinel" in object;
    } catch (exception) {
        // returns falsy
    }
}

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document == "undefined" ||
        doesDefinePropertyWork(document.createElement("div"));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty,
            definePropertiesFallback = Object.defineProperties;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object != "object" && typeof object != "function") || object === null) {
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        }
        if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null) {
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        }
        // make a valiant attempt to use the real defineProperty
        // for I8's DOM elements.
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        // If it's a data property.
        if (owns(descriptor, "value")) {
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors) {
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            }
            // If we got that far then getters and setters can be defined !!
            if (owns(descriptor, "get")) {
                defineGetter(object, property, descriptor.get);
            }
            if (owns(descriptor, "set")) {
                defineSetter(object, property, descriptor.set);
            }
        }
        return object;
    };
}

// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (!Object.defineProperties || definePropertiesFallback) {
    Object.defineProperties = function defineProperties(object, properties) {
        // make a valiant attempt to use the real defineProperties
        if (definePropertiesFallback) {
            try {
                return definePropertiesFallback.call(Object, object, properties);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        for (var property in properties) {
            if (owns(properties, property) && property != "__proto__") {
                Object.defineProperty(object, property, properties[property]);
            }
        }
        return object;
    };
}

// ES5 15.2.3.8
// http://es5.github.com/#x15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
// http://es5.github.com/#x15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
            if (typeof object == "function") {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    })(Object.freeze);
}

// ES5 15.2.3.10
// http://es5.github.com/#x15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
// http://es5.github.com/#x15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}

// ES5 15.2.3.12
// http://es5.github.com/#x15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}

// ES5 15.2.3.13
// http://es5.github.com/#x15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        // 1. If Type(O) is not Object throw a TypeError exception.
        if (Object(object) !== object) {
            throw new TypeError(); // TODO message
        }
        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}

});
;// Copyright 2009-2012 by contributors, MIT License
// vim: ts=4 sts=4 sw=4 expandtab

// Module systems magic dance
(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(definition);
    // YUI3
    } else if (typeof YUI == "function") {
        YUI.add("es5", definition);
    // CommonJS and <script>
    } else {
        definition();
    }
})(function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

function Empty() {}

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        if(target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }
        // XXX bound.length is never writable, so don't even try
        //
        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.
        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var slice = prototypeOfArray.slice;
// Having a toString local variable name breaks in Opera so use _toString.
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
// Default value for second param
// [bugfix, ielt9, old browsers]
// IE < 9 bug: [1,2].splice(0).join("") == "" but should be "12"
if ([1,2].splice(0).length != 2) {
    var array_splice = Array.prototype.splice;
    Array.prototype.splice = function(start, deleteCount) {
        if (!arguments.length) {
            return [];
        } else {
            return array_splice.apply(this, [
                start === void 0 ? 0 : start,
                deleteCount === void 0 ? (this.length - start) : deleteCount
            ].concat(slice.call(arguments, 2)))
        }
    };
}

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) == undefined but should be "1"
if ([].unshift(0) != 1) {
    var array_unshift = Array.prototype.unshift;
    Array.prototype.unshift = function() {
        array_unshift.apply(this, arguments);
        return this.length;
    };
}

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return _toString(obj) == "[object Array]";
    };
}

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object("a"),
    splitString = boxedString[0] != "a" || !(0 in boxedString);

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                // context
                fun.call(thisp, self[i], i, object);
            }
        }
    };
}

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, object);
        }
        return result;
    };
}

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                    object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, object)) {
                return false;
            }
        }
        return true;
    };
}

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, object)) {
                return true;
            }
        }
        return false;
    };
}

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length == 1) {
            throw new TypeError("reduce of empty array with no initial value");
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError("reduce of empty array with no initial value");
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        }

        return result;
    };
}

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length == 1) {
            throw new TypeError("reduceRight of empty array with no initial value");
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError("reduceRight of empty array with no initial value");
                }
            } while (true);
        }

        do {
            if (i in this) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        } while (i--);

        return result;
    };
}

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1)) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    };
}

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {

        if (
            (typeof object != "object" && typeof object != "function") ||
            object === null
        ) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000,
    negativeYearString = "-000001";
if (
    !Date.prototype.toISOString ||
    (new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1)
) {
    Date.prototype.toISOString = function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError("Date.prototype.toISOString called on non-finite value.");
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/kriskowal/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(),
            this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? "-" : (year > 9999 ? "+" : "")) +
            ("00000" + Math.abs(year))
            .slice(0 <= year && year <= 9999 ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = "0" + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + "-" + result.slice(0, 2).join("-") +
            "T" + result.slice(2).join(":") + "." +
            ("000" + this.getUTCMilliseconds()).slice(-3) + "Z"
        );
    };
}


// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = false;
try {
    dateToJSONIsSupported = (
        Date.prototype.toJSON &&
        new Date(NaN).toJSON() === null &&
        new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
        Date.prototype.toJSON.call({ // generic
            toISOString: function () {
                return true;
            }
        })
    );
} catch (e) {
}
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be toPrimitive(O, hint Number).
        var o = Object(this),
            tv = toPrimitive(o),
            toISO;
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === "number" && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        toISO = o.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof toISO != "function") {
            throw new TypeError("toISOString property is not callable");
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(o);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (!Date.parse || "Date.parse is buggy") {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

        // Date.length === 7
        function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length == 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        };

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp("^" +
            "(\\d{4}|[\+\-]\\d{6})" + // four-digit year capture or sign +
                                      // 6-digit extended year
            "(?:-(\\d{2})" + // optional month capture
            "(?:-(\\d{2})" + // optional day capture
            "(?:" + // capture hours:minutes:seconds.milliseconds
                "T(\\d{2})" + // hours capture
                ":(\\d{2})" + // minutes capture
                "(?:" + // optional :seconds.milliseconds
                    ":(\\d{2})" + // seconds capture
                    "(?:\\.(\\d{3}))?" + // milliseconds capture
                ")?" +
            "(" + // capture UTC offset component
                "Z|" + // UTC capture
                "(?:" + // offset specifier +/-hours:minutes
                    "([-+])" + // sign capture
                    "(\\d{2})" + // hours offset capture
                    ":(\\d{2})" + // minutes offset capture
                ")" +
            ")?)?)?)?" +
        "$");

        var months = [
            0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
        ];

        function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        }

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            Date[key] = NativeDate[key];
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]),
                    month = Number(match[2] || 1) - 1,
                    day = Number(match[3] || 1) - 1,
                    hour = Number(match[4] || 0),
                    minute = Number(match[5] || 0),
                    second = Number(match[6] || 0),
                    millisecond = Number(match[7] || 0),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    offset = !match[4] || match[8] ?
                        0 : Number(new NativeDate(1970, 0)),
                    signOffset = match[9] === "-" ? 1 : -1,
                    hourOffset = Number(match[10] || 0),
                    minuteOffset = Number(match[11] || 0),
                    result;
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond + offset;
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}


//
// String
// ======
//


// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14
// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
if("0".split(void 0, 0).length) {
    var string_split = String.prototype.split;
    String.prototype.split = function(separator, limit) {
        if(separator === void 0 && limit === 0)return [];
        return string_split.apply(this, arguments);
    }
}

// ECMA-262, 3rd B.2.3
// Note an ECMAScript standart, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
if("".substr && "0b".substr(-1) !== "b") {
    var string_substr = String.prototype.substr;
    /**
     *  Get the substring of a string
     *  @param  {integer}  start   where to start the substring
     *  @param  {integer}  length  how many characters to return
     *  @return {string}
     */
    String.prototype.substr = function(start, length) {
        return string_substr.call(
            this,
            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
            length
        );
    }
}

// ES5 15.5.4.20
// http://es5.github.com/#x15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        if (this === undefined || this === null) {
            throw new TypeError("can't convert "+this+" to object");
        }
        return String(this)
            .replace(trimBeginRegexp, "")
            .replace(trimEndRegexp, "");
    };
}

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer

function toInteger(n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return (
        input === null ||
        type === "undefined" ||
        type === "boolean" ||
        type === "number" ||
        type === "string"
    );
}

function toPrimitive(input) {
    var val, valueOf, toString;
    if (isPrimitive(input)) {
        return input;
    }
    valueOf = input.valueOf;
    if (typeof valueOf === "function") {
        val = valueOf.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    toString = input.toString;
    if (typeof toString === "function") {
        val = toString.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    throw new TypeError();
}

// ES5 9.9
// http://es5.github.com/#x9.9
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert "+o+" to object");
    }
    return Object(o);
};

});
;(function() {

   window.L = { turtle: {} };

}());
;
(function(L) {


   L.math = {};


   L.math.degToRad = function(degrees) {
      return degrees * ( Math.PI / 180 );
   };

   L.math.rotationMatrixUp = function(a) {
      return [ [ Math.cos(a), -Math.sin(a), 0 ], // col1
               [ Math.sin(a), Math.cos(a), 0 ],  // col2
               [ 0, 0, 1 ] ];                    // col3
   };

   L.math.rotationMatrixLeft = function(a) {
      return [ [ Math.cos(a), 0, Math.sin(a) ],    // col1
               [ 0, 1, 0 ],                        // col2
               [ -Math.sin(a), 0, Math.cos(a) ] ]; // col3
   };

   L.math.rotationMatrixHeading = function(a) {
      return [ [ 1, 0, 0 ],                        // col1
               [ 0, Math.cos(a), Math.sin(a) ],    // col2
               [ 0, -Math.sin(a), Math.cos(a) ] ]; // col3
   };

   L.math.matrixMult = function(m1, m2) {

      var out = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

      out[0][0] = m1[0][0] * m2[0][0] + m1[1][0] * m2[0][1] + m1[2][0] * m2[0][2];
      out[0][1] = m1[0][1] * m2[0][0] + m1[1][1] * m2[0][1] + m1[2][1] * m2[0][2];
      out[0][2] = m1[0][2] * m2[0][0] + m1[1][2] * m2[0][1] + m1[2][2] * m2[0][2];

      out[1][0] = m1[0][0] * m2[1][0] + m1[1][0] * m2[1][1] + m1[2][0] * m2[1][2];
      out[1][1] = m1[0][1] * m2[1][0] + m1[1][1] * m2[1][1] + m1[2][1] * m2[1][2];
      out[1][2] = m1[0][2] * m2[1][0] + m1[1][2] * m2[1][1] + m1[2][2] * m2[1][2];

      out[2][0] = m1[0][0] * m2[2][0] + m1[1][0] * m2[2][1] + m1[2][0] * m2[2][2];
      out[2][1] = m1[0][1] * m2[2][0] + m1[1][1] * m2[2][1] + m1[2][1] * m2[2][2];
      out[2][2] = m1[0][2] * m2[2][0] + m1[1][2] * m2[2][1] + m1[2][2] * m2[2][2];

      return out;
   };

   function absoluteValue(v) {
      return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
   };

   function dotProduct (v1, v2) {
      return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
   };

   L.math.absCrossProduct = function(v1, v2) {
      var absV1 = absoluteValue(v1),
          absV2 = absoluteValue(v2),
          angle = Math.acos(dotProduct(v1, v2) / (absV1 * absV2));

      return absV1 * absV2 * Math.sin(angle);
   };



}(L));
;
(function(L) {

   function Turtle() { }

   Turtle.prototype.step = function(string, i, state, context) {

      var letter, ruleForLetter, endOfParams,
          paramString, params;

      letter = string.charAt(i);

      if (ruleForLetter = this.fns[letter]) {

         if (string.charAt(i + 1) !== '(') {
            ruleForLetter.call(state, context);
         } else {
            endOfParams = string.indexOf(")", i);
            paramString = string.substring(i + 2, endOfParams);

            params = paramString.split(",");
            params.push(context);

            ruleForLetter.apply(state, params);

            i = endOfParams;
         }
      } 

      return i;

   };


   L.Turtle = Turtle;

}(L));

;
(function(L) {

   L.turtle.fns = { };

   L.turtle.fns["F"] = function(n, context) { 
      if (!context) {
         context = n;
         n = this.defaultDistance;
      }

      /* move n in the current direction */
      context.beginPath();
      context.lineWidth = this.lineWidth;
      context.moveTo(this.position[0], this.position[1]);

      this.position[0] = this.position[0] + n * this.heading[0];
      this.position[1] = this.position[1] + n * this.heading[1];
      this.position[2] = this.position[2] + n * this.heading[2];

      context.lineTo(this.position[0], this.position[1]);
      context.stroke();

      if (this.tropismEnabled) { 
         var angle = this.tropismConstant * L.math.absCrossProduct(this.heading, this.tropism),
             orientationMatrix = L.math.matrixMult([this.heading, this.left, this.up], L.math.rotationMatrixLeft(angle));

         this.heading = orientationMatrix[0];
         this.left = orientationMatrix[1];
         this.up = orientationMatrix[2];
      }

   };


   L.turtle.fns["f"] = function(n, context) { 
      if (!context) {
         context = n;
         n = this.defaultDistance;
      }

      /* move n without drawing */
      this.position[0] = this.position[0] + n * this.heading[0];
      this.position[1] = this.position[1] + n * this.heading[1];
      this.position[2] = this.position[2] + n * this.heading[2];
   };


   L.turtle.fns["+"] = function(n, context) { 
      if (!context) {
         context = n;
         n = this.defaultAngle;
      }

      /* rotate around u ?!? */
      var orientationMatrix = L.math.matrixMult([this.heading, this.left, this.up], L.math.rotationMatrixUp(L.math.degToRad(n)));

      this.heading = orientationMatrix[0];
      this.left = orientationMatrix[1];
      this.up = orientationMatrix[2];
   };


   L.turtle.fns["-"] = function(n, context) {
      if (!context) {
         context = n;
         n = this.defaultAngle;
      }

      L.turtle.fns["+"].call(this, -n, context);
   };


   L.turtle.fns["&"] = function(n, context) { 
      /* rotate around l ?!? */
      var orientationMatrix = L.math.matrixMult([this.heading, this.left, this.up], L.math.rotationMatrixLeft(L.math.degToRad(n)));

      this.heading = orientationMatrix[0];
      this.left = orientationMatrix[1];
      this.up = orientationMatrix[2];
   };


   L.turtle.fns["/"] = function(n, context) { 
      /* rotate around h ?!? */
      var orientationMatrix = L.math.matrixMult([this.heading, this.left, this.up], L.math.rotationMatrixHeading(L.math.degToRad(n)));

      this.heading = orientationMatrix[0];
      this.left = orientationMatrix[1];
      this.up = orientationMatrix[2];
   };


   L.turtle.fns["!"] = function(n, context) { 
      /* set the width of the line */
      this.lineWidth = n;
   };


   L.turtle.fns["["] = function(context) {

      this.pushState();

   };


   L.turtle.fns["]"] = function(context) {

      this.popState();

   };


}(L))
;

(function(L) {

   function Organic(state, fns) {
      this.initialState = state;
      this.fns = fns;
   }

   Organic.prototype = new L.Turtle();

   Organic.prototype.render = function(string, context, callback) {

      var root = this._buildTree(string);

      root.state = this.initialState.duplicate();

      this._renderTree(root, context, callback);

   };


   Organic.prototype._buildTree = function(instructions) {

      var letter, childNode, nodeInstructions = "", currentNode;

      currentNode = {
         children: [],
         instructions: ""
      };

      for (var i = 0; i < instructions.length; i++) {

         letter = instructions.charAt(i);

         if (letter === "[") {
            childNode = this._buildTree(instructions.substr(i+1));
            currentNode.instructions += "#" + (currentNode.children.push(childNode) - 1);

            i += childNode.endIndex + 1;
         } else if (letter === "]") {
            break;
         } else {
            currentNode.instructions += letter;
         }

      }

      currentNode.endIndex = i;

      return currentNode;

   }

   Organic.prototype._renderTree = function(node, context) {

      var letter, ruleForLetter, out = "",
          endOfParams, paramString, params, instructions, state;

      instructions = node.instructions;
      state = node.state;

      for (var i = 0; i < instructions.length; i++) {

         letter = instructions.charAt(i);

         if (ruleForLetter = this.fns[letter]) {

            if (ruleForLetter.length === 1) {    // function for letter takes no params other than context
               ruleForLetter.call(state, context);
            } else {
               endOfParams = instructions.indexOf(")", i);
               paramString = instructions.substring(i + 2, endOfParams);

               params = paramString.split(",");
               params.push(context);

               if (params.length != ruleForLetter.length) throw new Error("Could not extract the correct number of parameters for " + letter);

               out += ruleForLetter.apply(state, params);

               i = endOfParams;
            }
         } else if ( letter === "#" ) {

            node.children[+instructions.charAt(++i)].state = state.duplicate();

         } 
      }

      for (i = 0; i < node.children.length; i++) {
         setTimeout(this._renderTree.bind(this, node.children[i], context), 50);
      }
   }

   L.Turtle.Organic = Organic;

}(L))
;
(function(L) {

   function Recursive(state, fns) {
      this.initialState = state;
      this.fns = fns;
   }

   Recursive.prototype = new L.Turtle();

   Recursive.prototype.render = function(string, context, callback) {

      this._renderRecurse(string, this.initialState.duplicate(), context, callback);

   };

   Recursive.prototype._renderRecurse = function(string, state, context, callback) {

      var i;

      if (string.length > 0) {

         i = this.step(string, 0, state, context);
         setTimeout(this._renderRecurse.bind(this, string.substring((i === 0) ? 1 : i), state, context, callback), 0);

      } else { callback && callback(); }

   };

   L.Turtle.Recursive = Recursive;

}(L))
;
(function(L) {

   function Simple(initialState, fns) {
      this.initialState = initialState;
      this.fns = fns;
   };

   Simple.prototype = new L.Turtle();

   Simple.prototype.render = function(string, context, callback) {

      var state = this.initialState.duplicate();

      for (var i = 0; i < string.length; i++) {
         i = this.step(string, i, state, context);
      }

      callback && callback();

   };

   L.Turtle.Simple = Simple;

}(L));

;

(function(L) {

   function State(state) {
      this.stack = [ ];
      this.fromObject(state);
   }

   State.prototype.withLineWidth = function(lineWidth) {
      this.lineWidth = lineWidth;
      return this;
   };

   State.prototype.withDefaultDistance = function(d) {
      this.defaultDistance = d;
      return this;
   };

   State.prototype.withPosition = function(x, y, z) {
      this.position = [ x, y, z ];
      return this;
   };

   State.prototype.withTropismEnabled = function(enabled) {
      this.tropismEnabled = enabled;
      return this;
   };

   State.prototype.withTropismVector = function(i, j, k) {
      this.tropism = [ i, j, k ];
      return this;
   };

   State.prototype.withTropismConstant = function(c) {
      this.tropismConstant = c;
      return this;
   };

   State.prototype.pushState = function() {
      this.stack.push(this.toObject());
   };

   State.prototype.popState = function() {
      this.fromObject(this.stack.pop());
   };

   State.prototype.duplicate = function() {
      return new State(this.toObject());
   };

   State.prototype.fromObject = function(state) {
      this.lineWidth = (state && state.lineWidth) || 1;
      this.defaultDistance = (state && state.defaultDistance) || 10;
      this.defaultAngle = (state && state.defaultAngle) || 90;

      this.position = (state && state.position) || [ 0, 0, 0 ];
      this.heading = (state && state.heading) || [ 0, -1, 0 ];
      this.left = (state && state.left) || [ -1, 0, 0 ];
      this.up = (state && state.up) || [ 0, 0, -1 ];

      this.tropismEnabled = (state && state.tropismEnabled !== undefined) ? !!state.tropismEnabled : false;
      this.tropism = (state && state.tropism) || [ 0, 0, 0 ];
      this.tropismConstant = (state && state.tropismConstant) || 1;
   };

   State.prototype.toObject = function() {
      return {
         lineWidth: this.lineWidth,
         defaultDistance: this.defaultDistance,
         defaultAngle: this.defaultAngle,
         position: [ this.position[0], this.position[1], this.position[2] ],
         heading: [ this.heading[0], this.heading[1], this.heading[2] ],
         left: [ this.left[0], this.left[1], this.left[2] ],
         up: [ this.up[0], this.up[1], this.up[2] ],
         tropismEnabled: this.tropismEnabled,
         tropism: this.tropism && [ this.tropism[0], this.tropism[1], this.tropism[2] ],
         tropismConstant: this.tropismConstant
      };
   };

   L.Turtle.State = State;

}(L));

;
(function(L) {

   function System(axiom, constants, rules) {

      if (typeof axiom === 'object') {
         this.axiom = axiom.axiom;
         this.constants = axiom.constants;
         this.rules = axiom.rules;
      } else {
         this.axiom = axiom;
         this.constants = constants;
         this.rules = rules;
      }

   }

   System.prototype.iterate = function(times, callback, string) {

      var letter, ruleForLetter, out = "",
          endOfParams, paramString, params, ruleType;

      string = string || this.axiom;

      if (times === 0) { callback(string); return; }

      for (var i = 0; i < string.length; i++) {
         letter = string.charAt(i);

         if (ruleForLetter = this.rules[letter]) {
            ruleType = typeof ruleForLetter;

            if (ruleType === 'string') {
               out += ruleForLetter;
            } else if (ruleType === 'function') {

               if (ruleForLetter.length === 0) {    // function for letter takes no params
                  out += ruleForLetter.call(this.constants);
               } else {
                  endOfParams = string.indexOf(")", i);
                  paramString = string.substring(i + 2, endOfParams);
                  params = paramString.split(",");

                  if (params.length != ruleForLetter.length) throw new Error("Could not extract the correct number of parameters for " + letter);

                  out += ruleForLetter.apply(this.constants, params);

                  i = endOfParams;
               }

            } else if (ruleType === 'object') { /* implement stochastic rules with objects mapping their likelihoods */ }

         } else {
            out += letter;
         }
      }

      setTimeout(this.iterate.bind(this, times - 1, callback, out), 0);
   };

   L.System = System;

}(L));

;
(function(L) {

   L.examples = {

      tree: {
         name: "Tree",
         system: new L.System({
            axiom: "!(1)F(130)/(45)A",
            constants: {
               "d1": 94.74,  /* divergence angle 1 */
               "d2": 132.63, /* divergence angle 2 */
               "a": 18.95,   /* branching angle */
               "lr": 1.009,  /* elongation rate */
               "vr": 1.532   /* width increase rate */
            },
            rules: {
               "A": function() { 
                  return "!(" + this.vr + ")F(30)[&(" + this.a +")F(30)A]/(" + this.d1 + ")" + 
                     "[&(" + this.a + ")F(30)A]/(" + this.d2 + ")[&(" + this.a + ")F(30)A]";
               },
               "F": function(l) { return "F(" + (l * this.lr) + ")"; },
               "!": function(w) { return "!(" + (w * this.vr) + ")"; }
            }
         }),
         state: new L.Turtle.State()
            .withLineWidth(1.732)
            .withTropismEnabled(true)
            .withTropismVector(0, -1, 0)
            .withTropismConstant(0.25),
         iterations: 7
      },

      quadratic_snowflake: {
         name: "Quadratic Snowflake",
         system: new L.System({
            axiom: "-F",
            rules: {
               F: "F+F-F-F+F"
            }
         }),
         state: new L.Turtle.State()
            .withDefaultDistance(5),
         iterations: 4
      }

   };

}(L));

;/**
 * @class
 */
var Subscribable = (function () {

   "use strict";

   /**
    * The Subscribable class is the underlying component in a pub/sub application providing the ability
    * to "fire" events and bind handlers using "on" and remove them again with "un"
    *
    * @constructor
    * @name Subscribable
    */
   function Subscribable() {
   }

   /**
    *
    * @param {Object} subscribable
    */
   Subscribable.prepareInstance = function(subscribable) {
      subscribable.__events = {};
      subscribable.__handlers = [];
      subscribable.on = Subscribable.on;
      subscribable.un = Subscribable.un;
      subscribable.fire = Subscribable.fire;
      subscribable.hasListener = Subscribable.hasListener;
   };

   /**
    * The events object stores the names of the events that have listeners and the numeric IDs of the handlers
    * that are listening to the events.
    * @type {Object[]}
    */
   Subscribable.prototype.__events = null;

   /**
    * The handlers object is an array of handlers that will respond to the events being fired.
    * @type {Object[]}
    */
   Subscribable.prototype.__handlers = null;

   /**
    *
    */
   Subscribable.prototype.on = function() {
      Subscribable.prepareInstance(this);
      return this.on.apply(this, arguments);
   };

   /**
    *
    */
   Subscribable.prototype.un = function() {
      return this;
   };

   /**
    *
    */
   Subscribable.prototype.fire = function() {
      return true;
   };

   /**
    * Checks for whether there are any listeners for the supplied event type, where the event type can either be the
    * string name of an event or an event constructor.
    *
    * When the eventType parameter is omitted, the method will check for a handler against any event type.
    *
    * @param {String|Function} [eventType]
    */
   Subscribable.prototype.hasListener = function(eventType) {
      return false;
   };

   /**
    * Fires the named event with any arguments used as the call to fire.
    *
    * @param {String} eventName
    */
   Subscribable.fire = function(eventName) {
      var i, l,
         returnValue,
         args,
         handler,
         handlerIds;

      if(typeof eventName == 'object') {
         args = [eventName];
         eventName = eventName.constructor.toString();
      }

      handlerIds = Subscribable._getHandlersList(this, eventName, false);

      if(handlerIds && handlerIds.length) {
         args = args || Array.prototype.slice.call(arguments, 1);
         for(returnValue, i = 0, l = handlerIds.length; i < l && returnValue !== false; i++) {
            if(handler = this.__handlers[handlerIds[i]]) {
               returnValue = handler[0].apply(handler[1], args);
            }
         }
         return returnValue !== false;
      }

      return true;
   };

   /**
    * Gets the list of handler IDs for the supplied event name in the Subscribable instance. When
    * the create parameter is set to true and the event has not yet been set up in the Subscribable
    * it will be created.
    *
    * @param {Subscribable} instance
    * @param {String} eventName
    * @param {Boolean} create
    * @return {Number[]}
    */
   Subscribable._getHandlersList = function(instance, eventName, create) {
      eventName = ('' + eventName).toLowerCase();
      if(!instance.__events[eventName] && create) {
         instance.__events[eventName] = [];
      }
      return instance.__events[eventName];
   };

   /**
    * Attaches the supplied handler/scope as a listener in the supplied event list.
    *
    * @param {Function} handler
    * @param {Object} scope
    * @param {Number[]} eventList
    */
   Subscribable._saveHandler = function(instance, handler, scope, eventList) {
      var handlerId = instance.__handlers.length;
      instance.__handlers.push( [handler, scope, handlerId] );
      eventList.push(handlerId);

      return handlerId;
   };

   /**
    * Attaches the supplied handler and scope as a listener for the supplied event name. The return value is
    * the numerical ID of the handler that has been added to allow for removal of a single event handler in the
    * "un" method.
    *
    * @param {String} eventName
    * @param {Function} handler
    * @param {Object} scope
    * @return {Number}
    */
   Subscribable.on = function(eventName, handler, scope) {
      return Subscribable._saveHandler(this, handler, scope, Subscribable._getHandlersList(this, eventName, true));
   };

   /**
    * Remove handlers for the specified selector - the selector type can either be a number (which is the ID of a single
    * handler and is the result of using the .on method), a string event name (which is the same string used as the event
    * name in the .on method), the Function constructor of an event object (that has a .toString method to return the
    * name of the associated event) or an object that is the scope of a handler (in which case, any handler for any
    * event that uses that object as the scope will be removed).
    *
    * @param {Object|String|Number|Function} un
    * @param {Object} [scopeCheck]
    */
   Subscribable.un = function(un, scopeCheck) {
      var typeofRemoval = typeof un;
      switch(typeofRemoval) {
         case 'number':
            Subscribable.removeSingleEvent(this, un, scopeCheck);
            break;

         case 'string':
         case 'function':
            un = ('' + un).toLowerCase();
            Subscribable.removeMultipleEvents(this,
               Subscribable._getHandlersList(this, un, false), scopeCheck);
            if(scopeCheck) {
               Subscribable.consolidateEvents(this, un);
            }
            break;

         default:
            if(un) {
               Subscribable.removeMultipleHandlers(this, this.__handlers, un || null);
               Subscribable.consolidateEvents(this);
            }
            else {
               this.__handlers = [];
               this.__events = {};
            }
            break;
      }
   };

   /**
    * Consolidates the handler IDs registered for the supplied named event; when the event name is not specified
    * all event containers will be consolidated.
    *
    * @param {String} [eventName]
    */
   Subscribable.consolidateEvents = function(instance, eventName) {
      if(!arguments.length) {
         for(var eventName in instance.__events) {
            Subscribable.consolidateEvents(eventName);
         }
      }

      var handlerList = instance.__events[eventName];

      if(handlerList && handlerList.length) {
         for(var i = handlerList.length - 1; i >= 0; i--) {
            if(!instance.__handlers[handlerList[i]]) {
               handlerList.splice(i,1);
            }
         }
      }

      if(handlerList && !handlerList.length) {
         delete instance.__events[eventName];
      }
   };

   /**
    * Attempts to nullify the handler with the supplied list of handler IDs in the Subscribable instance. If the
    * optional scopeCheck parameter is supplied, each handler will only be nullified when the scope it was attached
    * with is the same entity as the scopeCheck.
    *
    * @param {Subscribable} instance
    * @param {Number[]} handlerList
    * @param {Object} [scopeCheck]
    */
   Subscribable.removeMultipleEvents = function(instance, handlerList, scopeCheck) {
      for(var i = 0, l = handlerList.length; i < l; i++) {
         Subscribable.removeSingleEvent(instance, handlerList[i], scopeCheck);
      }
   };

   /**
    * Attempts to nullify the supplied handlers (note that in this case the handler array is the list of actual handlers
    * rather than their handler ID values). If the optional scopeCheck parameter is supplied, each handler will only be
    * nullified when the scope it was attached with the same entity as the scopeCheck.
    *
    * @param {Subscribable} instance
    * @param {Object[]} handlers
    * @param {Object} [scopeCheck]
    */
   Subscribable.removeMultipleHandlers = function(instance, handlers, scopeCheck) {
      var handler;
      for(var i = 0, l = handlers.length; i < l; i++) {
         if(handler = handlers[i]) {
            Subscribable.removeSingleEvent(instance, handler[2], scopeCheck);
         }
      }
   };

   /**
    * Attempts to nullify the handler with the supplied handler ID in the Subscribable instance. If the optional
    * scopeCheck parameter is supplied, the handler will only be nullified when the scope it was attached with is
    * the same entity as the scopeCheck.
    *
    * @param {Subscribable} instance
    * @param {Number} handlerId
    * @param {Object} [scopeCheck]
    */
   Subscribable.removeSingleEvent = function(instance, handlerId, scopeCheck) {
      if(instance.__handlers[handlerId]) {
         if(!scopeCheck || instance.__handlers[handlerId][1] === scopeCheck) {
            instance.__handlers[handlerId] = null;
         }
      }
   };

   /**
    *
    * @param {String|Function} [eventType]
    */
   Subscribable.hasListener = function(eventType) {
      var handlers, handlerIds, i, l;

      if(eventType === undefined) {
         handlers = this.__handlers;
         for(i = 0, l = handlers.length; i < l; i++) {
            if(!!handlers[i]) {
               return true;
            }
         }
      }

      else if(handlerIds = this.__events[('' + eventType).toLowerCase()]) {
         for(var i = 0, l = handlerIds.length; i < l; i++) {
            if(this.__handlers[handlerIds[i]]) {
               return true;
            }
         }
      }

      return false;
   };

   return Subscribable;

}());

/*
 * If this is being used in a browser as a requireJs or commonJs module, or is being used as part of a NodeJS
 * app, externalise the Subscribable constructor as module.exports
 */
if(typeof module !== 'undefined') {
   module.exports = Subscribable;
}
;
(function() {


   function Tweaker(element, alignment) {
      this.panels = [].slice.call(element.querySelectorAll('div'))
                      .map(function(panelElem) { return { element: panelElem }; });

      this._element = element;
      this._pinned = false;
      this._open = false;
      this._pinLink = null;

      this._buildDom();
      this.changeAlignment(alignment || Tweaker.ALIGN.RIGHT);
   }

   Tweaker.prototype.openPanel = function(panel) {

      var showing = panel.element.classList.contains('hidden') || 
                  (panel.link.classList.contains('selected') && this._pinned);

      this.hide();

      if (showing) { 
         this._element.classList.add('open');
         panel.element.classList.remove('hidden');
         panel.link.classList.add('selected');
         this._open = true;
      } else {
         panel.element.classList.add('hidden');
      }

   };

   Tweaker.prototype.changeAlignment = function(alignment) {

      var element = this._element;

      Object.keys(Tweaker.ALIGN).map(function(key) { return Tweaker.ALIGN[key]; })
            .forEach(function(cssClass) {
               document.body.classList.remove('tweaker-' + cssClass);
               element.classList.remove(cssClass);
            });

      document.body.classList.add('tweaker-' + alignment);
      element.classList.add(alignment);

   };

   Tweaker.prototype.show = function() {

      this.openPanel(this.panels[0]);

   };

   Tweaker.prototype.hide = function() {

      for (var i = 0; i < this.panels.length; i++) {
         this.panels[i].element.classList.add('hidden');
         this.panels[i].link.classList.remove('selected');
      }

      if (!this._pinned) {
         this._element.classList.remove('open');
         this._open = false;
      }

   };

   Tweaker.prototype.pin = function() {

      if (this._pinned) {
         document.body.classList.remove('tweaker-pinned');
         this._pinLink.classList.remove('selected');
      } else {
         document.body.classList.add('tweaker-pinned');
         this._pinLink.classList.add('selected');

         if (!this._open) {
            this.show();
         }
      }

      this._pinned = !this._pinned;

   };

   Tweaker.prototype._buildDom = function() {

      var panelsElement = document.createElement('ul'),
          toolsElement = document.createElement('ul'),
          panel;

      this._element.classList.add('tweaker');
      panelsElement.classList.add('panels');
      toolsElement.classList.add('tools');

      this._pinLink = this._addLinkTo(toolsElement, 'Pin', this._pinClicked.bind(this));

      for (var i = 0; i < this.panels.length; i++) {

         panel = this.panels[i];
         panel.element.classList.add('panel');
         panel.element.classList.add('hidden');

         panel.link = this._addLinkTo(panelsElement, 
               panel.element.getAttribute('data-title'), this._linkClicked.bind(this, panel));

      }

      document.documentElement.addEventListener('mousedown', this._bodyClicked.bind(this));

      this._element.appendChild(panelsElement);
      this._element.appendChild(toolsElement);

   };

   Tweaker.prototype._addLinkTo = function(element, text, clickHandler) {

      var linkContainer = document.createElement('li'),
          link = document.createElement('a');

      linkContainer.className = 'link-item';

      link.href = '#';
      link.innerText = text;
      link.addEventListener('click', clickHandler);

      linkContainer.appendChild(link);
      element.appendChild(linkContainer);

      return link;

   };

   Tweaker.prototype._pinClicked = function(evt) {

      evt.preventDefault();

      this.pin();

   };

   // walk up the dom to see if the target is part of the settings view
   // if not then hide
   Tweaker.prototype._bodyClicked = function(evt) {
   
      var elem = evt.target,
          clickInTweakerPanel = false;

      do {
         if (elem === this._element) { clickInTweakerPanel = true; break; }
      } while(elem = elem.parentNode);

      if (!clickInTweakerPanel && !this._pinned) this.hide();

   };

   Tweaker.prototype._linkClicked = function(panel, evt) {

      evt.preventDefault();
      this.openPanel(panel);

   };


   Tweaker.ALIGN = {
      RIGHT: 'right',
      BOTTOM: 'bottom',
      LEFT: 'left',
      TOP: 'top'
   };


   window.Tweaker = Tweaker;

}());
;
(function() {

   function DrawingBoard(element) {

      this._element = element;
      this._canvas = document.createElement('canvas');
      this._context = this._canvas.getContext('2d');
      this._contextProxy = new DrawingBoard.ContextProxy(this._context);

      element.appendChild(this._canvas);
      this.reflow();

      window.addEventListener('resize', this.reflow.bind(this));

   }


   DrawingBoard.prototype.reflow = function() {

      this.width = this._canvas.width = this._element.clientWidth;
      this.height = this._canvas.height = this._element.clientHeight;

      this._contextProxy.replay();

   };

   DrawingBoard.prototype.clear = function() {
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
   };

   DrawingBoard.prototype.getContext = function() {

      return this._contextProxy;

   };

   window.DrawingBoard = DrawingBoard;

}())
;
(function() {

   var FunctionType = { POINT: "point", UNKNOWN: 'unknown' },
       FunctionToType = {
          "moveTo": FunctionType.POINT,
          "lineTo": FunctionType.POINT
       };


   function ContextProxy(context) {

      this._context = context;
      this._recording = false;

      for (var key in this._context) {

         if (typeof this._context[key] === 'function') {
            this[key] = this._functionProxy.bind(this, key, FunctionToType[key] || FunctionType.UNKNOWN);
         } else {
            Object.defineProperty(this, key, {
               enumerable: true,
               get: this._getProxy.bind(this, key),
               set: this._setProxy.bind(this, key)
            });
         }
      }

   }

   ContextProxy.prototype.startRecording = function() {
      // should probably snap shot the state of all props of the context here
      // so we can go back to the same initial state when we replay
      this._recording = true;
      this._actions = [];
   };

   ContextProxy.prototype.stopRecording = function() { this._recording = false; };

   ContextProxy.prototype.replay = function() {
      var action;

      if (!this._actions || this._recording) return;

      for (var i = 0; i < this._actions.length; i++) {
         action = this._actions[i];

         switch (action.action) {
            case 'call':
               this._functionCall[action.type].apply(this, [action.key].concat(action.args));
               break;
            case 'set':
               this._context[action.key] = action.value;
               break;
         }
      }
   };

   ContextProxy.prototype._functionProxy = function(key, type) {
      var args = [].slice.call(arguments, 2);

      if (this._recording) this._actions.push({ action: 'call', type: type, key: key, args: args });

      this._functionCall[type].apply(this, [key].concat(args));
   };

   ContextProxy.prototype._getProxy = function(key) { return this._context[key]; };

   ContextProxy.prototype._setProxy = function(key, value) { 
      if (this._recording) this._actions.push({ action: 'set', key: key, value: value });

      this._context[key] = value;
   };

   ContextProxy.prototype._functionCall = { };

   ContextProxy.prototype._functionCall[FunctionType.POINT] = function(key, x, y) {
      this._context[key].call(this._context, x, y);
   };

   ContextProxy.prototype._functionCall[FunctionType.UNKNOWN] = function(key) {
      this._context[key].apply(this._context, [].slice.call(arguments, 1));
   };




   window.DrawingBoard.ContextProxy = ContextProxy;

}())
;
(function() {


   function LSystemSettings(element) {

      this._element = element;
      this._exampleDefinitions = Object.keys(L.examples).map(function(key) { return L.examples[key]; });

   }

   LSystemSettings.prototype = Object.create(Subscribable.prototype);

   LSystemSettings.prototype.getLSystem = function() { return this._lsystem; };

   LSystemSettings.prototype.getIterations = function() { return this._iterations; };

   LSystemSettings.prototype.setDefinition = function(definition) {

      this._definition = definition;
      this._lsystem = definition.system;
      this._iterations = definition.iterations;

      this._render();

      this.fire('lsystemChanged', definition);

   };

   LSystemSettings.prototype._render = function() {

      var lsystemIndex = this._exampleDefinitions.indexOf(this._definition);

      this._element.innerHTML = '';
      this._element.appendChild(
         blueprints('lsystem-settings', {
            exampleDefinitions: this._exampleDefinitions,
            currentDefinition: this._definition
         })
      );

      this._lsystemElement = this._element.querySelector('#lsystem');
      this._lsystemElement.querySelectorAll('option')[lsystemIndex].selected = true;
      this._lsystemElement.addEventListener('change', this._changeDefinition.bind(this));

   };

   LSystemSettings.prototype._changeDefinition = function(evt) {

      var lsystemIndex = this._lsystemElement.children[this._lsystemElement.selectedIndex].value;

      this.setDefinition(this._exampleDefinitions[lsystemIndex]);

   };


   window.LSystemSettings = LSystemSettings;

}());

;(function(doc) {

var ce="createElement",
ct="createTextNode",
ac="appendChild",
sa="setAttribute",
cf="createDocumentFragment";

function blueprints(id, data) {
	return blueprints._s[id](data, blueprints);
}

blueprints._s = { };
blueprints._s["edit-vector"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("li");
	elem0[sa]("class", "vector");
	fragment[ac](elem0);
	
	var elem2 = doc[ce]("h3");
	elem0[ac](elem2);
	elem2[ac](doc[ct](name));
	
	var elem5 = doc[ce]("label");
	elem0[ac](elem5);
	elem5[ac](doc[ct]("i "));
	var elem7 = doc[ce]("input");
	elem7[sa]("type", "text");
	var elem7_attr1 = "";
	elem7_attr1 += "";
	elem7_attr1 += vector[0];
	elem7_attr1 += "";
	elem7[sa]("value", elem7_attr1);
	elem5[ac](elem7);
	
	var elem9 = doc[ce]("label");
	elem0[ac](elem9);
	elem9[ac](doc[ct]("j "));
	var elem11 = doc[ce]("input");
	elem11[sa]("type", "text");
	var elem11_attr1 = "";
	elem11_attr1 += "";
	elem11_attr1 += vector[1];
	elem11_attr1 += "";
	elem11[sa]("value", elem11_attr1);
	elem9[ac](elem11);
	
	var elem13 = doc[ce]("label");
	elem0[ac](elem13);
	elem13[ac](doc[ct]("k "));
	var elem15 = doc[ce]("input");
	elem15[sa]("type", "text");
	var elem15_attr1 = "";
	elem15_attr1 += "";
	elem15_attr1 += vector[2];
	elem15_attr1 += "";
	elem15[sa]("value", elem15_attr1);
	elem13[ac](elem15);
	
		}
	return fragment;
};


blueprints._s["lsystem-settings"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("div");
	elem0[sa]("class", "selector");
	fragment[ac](elem0);
	
	var elem2 = doc[ce]("label");
	elem2[sa]("for", "lsystem");
	elem0[ac](elem2);
	elem2[ac](doc[ct]("Pick an L-System to render: "));
	
	var elem5 = doc[ce]("select");
	elem5[sa]("id", "lsystem");
	elem0[ac](elem5);
	exampleDefinitions.forEach(function(definition, index) {
	var elem7 = doc[ce]("option");
	var elem7_attr0 = "";
	elem7_attr0 += "";
	elem7_attr0 += index;
	elem7_attr0 += "";
	elem7[sa]("value", elem7_attr0);
	elem5[ac](elem7);
	elem7[ac](doc[ct](definition.name));
	});
	
	
	var elem12 = doc[ce]("div");
	elem12[sa]("class", "definition");
	fragment[ac](elem12);
	
	var elem14 = doc[ce]("h1");
	elem12[ac](elem14);
	elem14[ac](doc[ct](currentDefinition.name));
	
	var elem17 = doc[ce]("h2");
	elem12[ac](elem17);
	elem17[ac](doc[ct]("Axiom"));
	
	var elem20 = doc[ce]("input");
	elem20[sa]("type", "text");
	var elem20_attr1 = "";
	elem20_attr1 += "";
	elem20_attr1 += currentDefinition.system.axiom;
	elem20_attr1 += "";
	elem20[sa]("value", elem20_attr1);
	elem12[ac](elem20);
	
	var elem22 = doc[ce]("h2");
	elem12[ac](elem22);
	elem22[ac](doc[ct]("Iterations"));
	
	var elem25 = doc[ce]("input");
	elem25[sa]("type", "text");
	var elem25_attr1 = "";
	elem25_attr1 += "";
	elem25_attr1 += currentDefinition.iterations;
	elem25_attr1 += "";
	elem25[sa]("value", elem25_attr1);
	elem12[ac](elem25);
	
	var elem27 = doc[ce]("h2");
	elem12[ac](elem27);
	elem27[ac](doc[ct]("Constants"));
	if (currentDefinition.system.constants) {
	var elem30 = doc[ce]("ul");
	elem30[sa]("class", "constants");
	elem12[ac](elem30);
	Object.keys(currentDefinition.system.constants).forEach(function(key) {
	var elem32 = doc[ce]("li");
	elem30[ac](elem32);
	
	var elem34 = doc[ce]("input");
	elem34[sa]("type", "text");
	elem34[sa]("class", "key");
	var elem34_attr2 = "";
	elem34_attr2 += "";
	elem34_attr2 += key;
	elem34_attr2 += "";
	elem34[sa]("value", elem34_attr2);
	elem32[ac](elem34);
	
	var elem36 = doc[ce]("input");
	elem36[sa]("type", "text");
	var elem36_attr1 = "";
	elem36_attr1 += "";
	elem36_attr1 += currentDefinition.system.constants[key];
	elem36_attr1 += "";
	elem36[sa]("value", elem36_attr1);
	elem32[ac](elem36);
	
	});
	}
	var elem40 = doc[ce]("h2");
	elem12[ac](elem40);
	elem40[ac](doc[ct]("Rules"));
	if (currentDefinition.system.rules) {
	var elem43 = doc[ce]("ul");
	elem12[ac](elem43);
	Object.keys(currentDefinition.system.rules).forEach(function(key) {
	var rule = currentDefinition.system.rules[key];
	var elem45 = doc[ce]("li");
	elem43[ac](elem45);
	
	var elem47 = doc[ce]("input");
	elem47[sa]("type", "text");
	elem47[sa]("class", "key");
	var elem47_attr2 = "";
	elem47_attr2 += "";
	elem47_attr2 += key;
	elem47_attr2 += "";
	elem47[sa]("value", elem47_attr2);
	elem45[ac](elem47);
	if (typeof rule === 'function') {
	var elem49 = doc[ce]("textarea");
	elem45[ac](elem49);
	elem49[ac](doc[ct](rule));
	} else {
	var elem52 = doc[ce]("input");
	elem52[sa]("type", "text");
	var elem52_attr1 = "";
	elem52_attr1 += "";
	elem52_attr1 += rule;
	elem52_attr1 += "";
	elem52[sa]("value", elem52_attr1);
	elem45[ac](elem52);
	}
	});
	}
		}
	return fragment;
};


blueprints._s["structure"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	
	var elem1 = doc[ce]("div");
	elem1[sa]("class", "canvas-container");
	fragment[ac](elem1);
	
	var elem3 = doc[ce]("div");
	elem3[sa]("class", "settings");
	fragment[ac](elem3);
	
	var elem5 = doc[ce]("div");
	elem5[sa]("class", "lsystem-settings");
	elem5[sa]("data-title", "L-System");
	elem3[ac](elem5);
	
	var elem7 = doc[ce]("div");
	elem7[sa]("class", "turtle-settings");
	elem7[sa]("data-title", "Turtle");
	elem3[ac](elem7);
	
		}
	return fragment;
};


blueprints._s["turtle-settings"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("div");
	elem0[sa]("class", "selector");
	fragment[ac](elem0);
	
	var elem2 = doc[ce]("label");
	elem2[sa]("for", "turtleType");
	elem0[ac](elem2);
	elem2[ac](doc[ct]("Pick the type of turtle to use when rendering: "));
	
	var elem5 = doc[ce]("select");
	elem5[sa]("id", "turtleType");
	elem0[ac](elem5);
	turtles.forEach(function(turtle) {
	var elem7 = doc[ce]("option");
	var elem7_attr0 = "";
	elem7_attr0 += "";
	elem7_attr0 += turtle;
	elem7_attr0 += "";
	elem7[sa]("value", elem7_attr0);
	elem5[ac](elem7);
	elem7[ac](doc[ct](turtle));
	});
	
	
	var elem12 = doc[ce]("div");
	elem12[sa]("class", "definition");
	fragment[ac](elem12);
	
	var elem14 = doc[ce]("h1");
	elem12[ac](elem14);
	elem14[ac](doc[ct]("Initial State"));
	
	var elem17 = doc[ce]("h2");
	elem12[ac](elem17);
	elem17[ac](doc[ct]("Orientation"));
	
	var elem20 = doc[ce]("ul");
	elem12[ac](elem20);
	elem20[ac](blueprints('edit-vector', { name: 'Position', vector: state.position }));
	elem20[ac](blueprints('edit-vector', { name: 'Heading', vector: state.heading }));
	elem20[ac](blueprints('edit-vector', { name: 'Left', vector: state.left }));
	elem20[ac](blueprints('edit-vector', { name: 'Up', vector: state.up }));
	
	var elem23 = doc[ce]("h2");
	elem12[ac](elem23);
	elem23[ac](doc[ct]("Defaults"));
	
	var elem26 = doc[ce]("ul");
	elem12[ac](elem26);
	
	var elem28 = doc[ce]("li");
	elem26[ac](elem28);
	var elem29 = doc[ce]("h3");
	elem28[ac](elem29);
	elem29[ac](doc[ct]("Distance"));
	var elem31 = doc[ce]("input");
	elem31[sa]("type", "text");
	var elem31_attr1 = "";
	elem31_attr1 += "";
	elem31_attr1 += state.defaultDistance;
	elem31_attr1 += "";
	elem31[sa]("value", elem31_attr1);
	elem28[ac](elem31);
	
	var elem33 = doc[ce]("li");
	elem26[ac](elem33);
	var elem34 = doc[ce]("h3");
	elem33[ac](elem34);
	elem34[ac](doc[ct]("Angle"));
	var elem36 = doc[ce]("input");
	elem36[sa]("type", "text");
	var elem36_attr1 = "";
	elem36_attr1 += "";
	elem36_attr1 += state.defaultAngle;
	elem36_attr1 += "";
	elem36[sa]("value", elem36_attr1);
	elem33[ac](elem36);
	
	
	var elem39 = doc[ce]("h2");
	elem12[ac](elem39);
	elem39[ac](doc[ct]("Styling"));
	
	var elem42 = doc[ce]("ul");
	elem12[ac](elem42);
	
	var elem44 = doc[ce]("li");
	elem42[ac](elem44);
	var elem45 = doc[ce]("h3");
	elem44[ac](elem45);
	elem45[ac](doc[ct]("Line Width"));
	var elem47 = doc[ce]("input");
	elem47[sa]("type", "text");
	var elem47_attr1 = "";
	elem47_attr1 += "";
	elem47_attr1 += state.lineWidth;
	elem47_attr1 += "";
	elem47[sa]("value", elem47_attr1);
	elem44[ac](elem47);
	
	
	var elem50 = doc[ce]("h2");
	elem12[ac](elem50);
	elem50[ac](doc[ct]("Tropism"));
	
	var elem53 = doc[ce]("ul");
	elem53[sa]("class", "tropism");
	elem12[ac](elem53);
	
	var elem55 = doc[ce]("li");
	elem53[ac](elem55);
	var elem56 = doc[ce]("h3");
	elem55[ac](elem56);
	elem56[ac](doc[ct]("Enabled"));
	var elem58 = doc[ce]("input");
	elem58[sa]("type", "checkbox");
	elem58[sa]("class", "enabled");
	var elem58_attr2 = "";
	elem58_attr2 += "";
	elem58_attr2 += state.tropismEnabled;
	elem58_attr2 += "";
	elem58[sa]("value", elem58_attr2);
	elem55[ac](elem58);
	
	var elem60 = doc[ce]("li");
	elem53[ac](elem60);
	var elem61 = doc[ce]("h3");
	elem60[ac](elem61);
	elem61[ac](doc[ct]("Constant"));
	var elem63 = doc[ce]("input");
	elem63[sa]("type", "text");
	elem63[sa]("class", "constant");
	var elem63_attr2 = "";
	elem63_attr2 += "";
	elem63_attr2 += state.tropismConstant;
	elem63_attr2 += "";
	elem63[sa]("value", elem63_attr2);
	elem60[ac](elem63);
	elem53[ac](blueprints('edit-vector', { name: 'Vector', vector: state.tropism }));
	
		}
	return fragment;
};
window.blueprints = blueprints;
})(document);;
(function() {


   function TurtleSettings(element, turtleType) {

      this._element = element;
      this._turtleType = turtleType;

   }

   TurtleSettings.prototype = Object.create(Subscribable.prototype);

   TurtleSettings.prototype.getTurtle = function() { return this._turtleType; };

   TurtleSettings.prototype.getInitialState = function() { return this._initialState; };

   TurtleSettings.prototype.setInitialState = function(state) {
      this._initialState = state; 

      this._render();
   };

   TurtleSettings.prototype._render = function() {

      var tropismEnabled = this._initialState.tropismEnabled;
      
      this._element.innerHTML = '';

      this._element.appendChild(
         blueprints('turtle-settings', {
            turtles: Object.keys(TurtleSettings.TURTLES),
            state: this._initialState
         })
      );

      if (tropismEnabled) {
         this._element.querySelector('.tropism .enabled').checked = true;
      } else {
         [].slice.call(document.querySelectorAll('.tropism .constant, .tropism .vector input')).forEach(function(elem) { elem.disabled = true; })
      }

      this._turtleTypeElement = this._element.querySelector('#turtleType')
      this._turtleTypeElement.addEventListener('change', this._changeTurtle.bind(this));

   };

   TurtleSettings.prototype._changeTurtle = function(evt) {

      var turtleType = this._turtleTypeElement.children[this._turtleTypeElement.selectedIndex].value;

      this._turtleType = TurtleSettings.TURTLES[turtleType];

      this.fire('typeChanged');

   };
   

   TurtleSettings.TURTLES = {
      'Simple': L.Turtle.Simple,
      'Recursive': L.Turtle.Recursive,
      'Organic': L.Turtle.Organic
   };


   window.TurtleSettings = TurtleSettings;

}());

;
(function() {


   // Based on http://algorithmicbotany.org/papers/#abop

   document.body.appendChild(blueprints('structure'));

   var settings = new Tweaker(document.querySelector(".settings")),
       lsystemSettings = new LSystemSettings(document.querySelector(".lsystem-settings")),
       turtleSettings = new TurtleSettings(document.querySelector(".turtle-settings"), L.Turtle.Simple),
       drawingBoard = new DrawingBoard(document.querySelector(".canvas-container")),
       context = drawingBoard.getContext();

   function render() {

      drawingBoard.clear();

      lsystemSettings.getLSystem().iterate(lsystemSettings.getIterations(), function(out) {

         context.startRecording();
         
         new (turtleSettings.getTurtle())(
            turtleSettings.getInitialState()
               .withPosition(drawingBoard.width / 2, drawingBoard.height, 0), 
            L.turtle.fns
         ).render(out, context, function() {
            context.stopRecording();
         });

      });

   }

   turtleSettings.on('typeChanged', render);
   lsystemSettings.on('lsystemChanged', function(definition) {

      turtleSettings.setInitialState(definition.state);
      render();

   });
   
   lsystemSettings.setDefinition(L.examples.tree);

}())
