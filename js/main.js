
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
