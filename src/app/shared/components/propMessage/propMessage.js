angular.module('app').component('propMessage', {
  templateUrl: myLocalized.partials + 'propMessage.html',
  controllerAs: 'messageCtrl',
  bindings: {
    message: '<',
    hoveredProp: '<'
  },
  controller: [
    '$scope', '$element', '$rootScope', function ($scope, $element, $rootScope) {
      this.messages = {
        'mamy_trouille' : "JE CHERCHE DES CITROUILLES !",
        "coupe_crushrun" : "Coupe de Crushrun remportée par Anar en 2021",
      };
      // $element.addClass('border-village');
      this.$onInit = ()=>{
        this.map = $scope.$parent;
        this.currentMessage = this.messages[this.hoveredProp.label];
        $element.css('left', this.hoveredProp.list[0].x + 'px');
        $element.css('top', this.hoveredProp.list[0].y - this.hoveredProp.height + 'px');
      };
    }
  ]
});