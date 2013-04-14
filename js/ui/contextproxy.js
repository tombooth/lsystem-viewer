
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
