
(function() {


   function LSystemSettings(element) {

      element.appendChild(
         blueprints('lsystem-settings', {
            lsystems: Object.keys(LSystemSettings.LSYSTEMS)
         })
      );

      this.lsystemElement = element.querySelector('#lsystem');

      this.lsystemElement.addEventListener('change', this._changeLSystem.bind(this));

   }

   LSystemSettings.prototype = Object.create(Subscribable.prototype);

   LSystemSettings.prototype._changeLSystem = function(evt) {

      var lsystemKey = this.lsystemElement.children[this.lsystemElement.selectedIndex].value;

      this.fire('lsystemChanged', LSystemSettings.LSYSTEMS[lsystemKey]);

   };


   LSystemSettings.LSYSTEMS = {
      "Tree": L.examples.tree,
      "Quadratic Snowflake": L.examples.quadratic_snowflake
   };


   window.LSystemSettings = LSystemSettings;

}());

