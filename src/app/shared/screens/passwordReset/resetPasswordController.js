angular.module('app').controller('resetPassword', ['accountFactory', '$scope', '$rootScope', '$location',
  function (accountFactory, $scope, $rootScope, $location) {
    $scope.$parent.info.isAppInit = true;
    $scope.request = {
      password: null,
      passwordConfirm: null
    };
    $scope.sendResetPassword = () => {
      accountFactory.resetPassword($location.search().key, $scope.request.password, $scope.request.passwordConfirm).then(e => {
        $rootScope.setAlert('success', 'Votre mot de passe a été changé avec succès! Vous pouvez vous connecter à présent.');
        $location.path('/map');
      }).catch($rootScope.handleError);
    }
  }]);