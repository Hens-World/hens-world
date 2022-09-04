angular.module('app').component('mediaSelectButton', {
  templateUrl: myLocalized.partials + 'mediaSelectButton.html',
  bindings: {
    field: '=',
    type: '@'
  },
  controllerAs: 'mediaSelectCtrl',
  controller: ['$scope', '$rootScope', '$element', function ($scope, $rootScope, $element) {
    if (!this.type) this.type = 'image';
    this.typeLabels = {
      image: 'Choisir une image',
      musique: 'Choisir une musique',
      video: 'Choisir une video',
      fichier: 'Choisir un fichier'
    };
    this.callback = (media) => {
      this.field = media.url;
    };
    this.onClick = () => {
      $rootScope.$broadcast('media-select-start', this.callback);
    };
  }]
});