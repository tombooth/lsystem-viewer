
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

