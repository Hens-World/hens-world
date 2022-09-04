hensApp.directive('alertManager', [
  '$rootScope', 'formFactory', ($rootScope, formFactory) => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'alertManager.html',
    scope: {},
    controller($scope, $element) {
      $scope.alert = {
        active: false,
        type: '',
        tag: '',
        message: '',
        duration: 0,
        infinite: false
      };
      $scope.alertTimer = 0;

      //duration is defined in deci second (because settimeout sucks)
      $scope.setAlert = $rootScope.setAlert = function (type, tag, duration, interpol) {
        if(type === 'halloween'){
          $rootScope.$broadcast('halloween_feed', {
            msg: tag
          });
          return;
        }
        $scope.alert.type = type;
        $scope.alert.tag = tag;
        $scope.alert.message = formFactory.translateMessage(type, tag, interpol);

        $scope.alertTimer = 0;
        if (duration === 0 && type !== "success") {
          $scope.alert.infinite = true;
        } else if (duration) {
          $scope.alert.infinite = false;
          $scope.alert.duration = duration;
        } else {
          $scope.alert.infinite = false;
          $scope.alert.duration = 50;
        }
        $scope.alert.active = true;
      };

      $rootScope.$on('alert:error', (scope, tag) => $scope.setAlert('error', tag, 0));

      $scope.closeAlert = () => $scope.alert.active = false;

      $scope.updateTimer = function () {
        if (!$scope.alert.infinite) {
          $scope.alertTimer++;
          if ($scope.alertTimer >= $scope.alert.duration) {
            $scope.alert.duration = 0;
            $scope.alertTimer = 0;
            $scope.alert.active = false;
            $scope.$apply();
          }
        }
      };

      $scope.update = setInterval($scope.updateTimer, 100);
    }
  })

]);
