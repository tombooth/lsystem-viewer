
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
