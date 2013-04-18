
(function() {


   // Based on http://algorithmicbotany.org/papers/#abop

   document.body.appendChild(blueprints('structure'));

   var settings = new Tweaker(document.querySelector(".settings")),
       lsystemSettings = new LSystemSettings(document.querySelector(".lsystem-settings")),
       turtleSettings = new TurtleSettings(document.querySelector(".turtle-settings")),
       drawingBoard = new DrawingBoard(document.querySelector(".canvas-container")),
       context = drawingBoard.getContext();

   function render(LSystemSpec, TurtleClass) {

      drawingBoard.clear();

      LSystemSpec.system.iterate(7, function(out) {

         context.startRecording();
         
         new TurtleClass(
            LSystemSpec.state
               .withPosition(drawingBoard.width / 2, drawingBoard.height, 0), 
            L.turtle.fns
         ).render(out, context, function() {
            context.stopRecording();
         });

      });

      /*L.examples.quadratic_snowflake.system.iterate(5, function(out) {

         new L.Turtle.Recursive(
            L.examples.quadratic_snowflake.state
               .withPosition(drawingBoard.width - 60, drawingBoard.height - 10, 0),
            L.turtle.fns
         ).render(out, context);

      });*/

   }

   var currentLSystem = L.examples.tree,
       currentTurtleType = L.Turtle.Simple;

   turtleSettings.on('typeChanged', function(type) { currentTurtleType = type; render(currentLSystem, type); });
   lsystemSettings.on('lsystemChanged', function(lsystem) { currentLSystem = lsystem; render(lsystem, currentTurtleType); });
   
   render(currentLSystem, currentTurtleType);

}())
