angular.module('app').controller('GuideTouristique', [
  '$rootScope', '$scope', function ($rootScope, $scope) {
    $scope.$parent.info.isAppInit = false;
    $rootScope.$emit('bottomNav:select', "Guide");

    setTimeout(()=>{
      $scope.$parent.info.isAppInit = true;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });
  }
]);