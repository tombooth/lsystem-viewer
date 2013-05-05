
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

