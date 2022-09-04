angular.module('app').controller('signupConfirm', ['accountFactory', '$location', '$rootScope', '$scope',
  function (accountFactory, $location, $rootScope, $scope) {
    $scope.$parent.info.isAppInit = false;
    $scope.imageLink = myLocalized.medias + 'common/world.png';
    accountFactory.activateAccount($location.search().key).then(res => {
      $scope.$parent.info.isAppInit = true;
    }).catch($rootScope.handleError);
  }]);