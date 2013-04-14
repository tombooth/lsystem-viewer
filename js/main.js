
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