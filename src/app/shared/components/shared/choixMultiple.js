angular.module('app').component('choixMultiple', {
  templateUrl: myLocalized.partials + 'choixMultiple.html',
  bindings: {
    onUpdate: "<",
    additionalInfo: "=",
    choices: "<" //Array<{label: string, value: string}>
  },
  controllerAs: 'choixCtrl',
  controller: ['$scope', '$element', function ($scope, $element) {
    $element.css('width', "100%");
    this.$onInit = () => {
      this.onChoixClick = (choix) => {
        this.choices.forEach(choix => choix.selected = false);
        choix.selected = true;
        this.onUpdate(choix, this.additionalInfo);
      };
    };
  }]
});