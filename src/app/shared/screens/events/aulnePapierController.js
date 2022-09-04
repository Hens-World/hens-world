angular.module('app').controller('AulnePapier', [
  '$scope', '$rootScope', 'eventsFactory', '$location', function ($scope, $rootScope, eventsFactory, $location) {
    $scope.$parent.info.isAppInit = false;
    eventsFactory.equinoxePrintemps.getSolutionNote().then(data => {
      $scope.note = data.data;
      $scope.$parent.info.isAppInit = true;
    }).catch($rootScope.handleError);

    $scope.getGraines = () => {
      $rootScope.setAlert('success', 'Vous avez obtenu des graines! Dépensez les sagement :)');
      $location.path('/map/wilwar/village');
    };
  }
]);