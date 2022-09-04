hensApp.directive('profilCompte', [
  'postFactory', '$routeParams', 'userFactory', 'socket', '$rootScope', 'accountFactory',
  (postFactory, $routeParams, userFactory, socket, $rootScope, accountFactory) => ({
    restrict: 'A',
    templateUrl: myLocalized.specPartials + 'profilCompte.html',
    scope: {
      user: '=',
      isMe: '='
    },
    controller($scope, $element) {
      $scope.shared = new ProfileCompteShared($scope, userFactory);

      $scope.toggleCompteMenu = () => {
        $scope.compteMenuOpened = !$scope.persoMenuOpened;
      };

      $scope.closeCompteMenu = () => {
        $scope.compteMenuOpened = false;
      };

      $rootScope.$on('compte-side-menu:set', (event, btn) => {
        $scope.state = btn;
      });

      setTimeout(()=>{
        $rootScope.$broadcast('compte-side-menu:request');
      }, 100);

      if ($scope.user) {
        $scope.displayMember($scope.user);
      } else {
        $scope.$watch('user', function (n, o) {
          if (n && n !== o) {
            $scope.displayMember($scope.user);
          }
        });
      }
    }
  })
]);
