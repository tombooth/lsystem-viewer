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

      if (this.tropism) { 
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

      this.tropism = (state && state.tropism);
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
            .withTropismVector(0, -1, 0)
            .withTropismConstant(0.25)
      },

      quadratic_snowflake: {
         system: new L.System({
            axiom: "-F",
            rules: {
               F: "F+F-F-F+F"
            }
         }),
         state: new L.Turtle.State()
            .withDefaultDistance(5)
      }

   };

}(L));

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

      link.href = '#';
      link.innerText = text;
      link.addEventListener('click', clickHandler);

      linkContainer.appendChild(link);
      element.appendChild(linkContainer);

      return link;

   };

   Tweaker.prototype._pinClicked = function(evt) {

      evt.preventDefault();

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
blueprints._s["lsystem-settings"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("h1");
	fragment[ac](elem0);
	elem0[ac](doc[ct]("Lsystem settings"));
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
	var elem0 = doc[ce]("h1");
	fragment[ac](elem0);
	elem0[ac](doc[ct]("Turtle settings"));
		}
	return fragment;
};
window.blueprints = blueprints;
})(document);;
(function() {


   // Based on http://algorithmicbotany.org/papers/#abop

   document.body.appendChild(blueprints('structure'));
   document.querySelector('.lsystem-settings').appendChild(blueprints('lsystem-settings'));
   document.querySelector('.turtle-settings').appendChild(blueprints('turtle-settings'));

   var settings = new Tweaker(document.querySelector(".settings")),
       drawingBoard = new DrawingBoard(document.querySelector(".canvas-container")),
       context = drawingBoard.getContext();


   L.examples.tree.system.iterate(7, function(out) {
      //context.startRecording();
      
      new L.Turtle.Organic(
         L.examples.tree.state
            .withPosition(drawingBoard.width / 2, drawingBoard.height, 0), 
         L.turtle.fns
      ).render(out, context, function() {
         console.log('rendering done');
      });

      //context.stopRecording();
   });

   /*L.examples.quadratic_snowflake.system.iterate(5, function(out) {

      new L.Turtle.Recursive(
         L.examples.quadratic_snowflake.state
            .withPosition(drawingBoard.width - 60, drawingBoard.height - 10, 0),
         L.turtle.fns
      ).render(out, context);

   });*/
   



}())
