hensApp.directive('profilCompte', [
  'postFactory', '$routeParams', 'userFactory', 'socket', '$rootScope',
  (postFactory, $routeParams, userFactory, socket, $rootScope) => ({
    restrict: 'A',
    templateUrl: myLocalized.specPartials + 'profilCompte.html',
    scope: {
      user: '=',
      isMe: '='
    },
    controller($scope, $element) {
      $scope.shared = new ProfileCompteShared($scope, userFactory);
    }
  })
]);
