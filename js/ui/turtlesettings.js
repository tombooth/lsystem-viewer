
(function() {


   function TurtleSettings(element) {

      element.appendChild(
         blueprints('turtle-settings', {
            turtles: Object.keys(TurtleSettings.TURTLES)
         })
      );

      this.turtleTypeElement = element.querySelector('#turtleType')
   
      this.turtleTypeElement.addEventListener('change', this._changeTurtle.bind(this));

   }

   TurtleSettings.prototype = Object.create(Subscribable.prototype);

   TurtleSettings.prototype._changeTurtle = function(evt) {

      var turtleType = this.turtleTypeElement.children[this.turtleTypeElement.selectedIndex].value;

      this.fire('typeChanged', TurtleSettings.TURTLES[turtleType]);

   };
   

   TurtleSettings.TURTLES = {
      'Simple': L.Turtle.Simple,
      'Recursive': L.Turtle.Recursive,
      'Organic': L.Turtle.Organic
   };


   window.TurtleSettings = TurtleSettings;

}());

