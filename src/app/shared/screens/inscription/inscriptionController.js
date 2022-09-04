angular.module('app').controller('Inscription', [
  '$scope', '$rootScope', '$location', 'accountFactory', 'formFactory', function ($scope, $rootScope, $location, accountFactory, formFactory) {
    $scope.$parent.info.isAppInit = false;
    $rootScope.$emit('bottomNav:select', "Connexion");

    $scope.$parent.info.isAppInit = true;

    $scope.charteRead = false;

    // $scope.registerForm = {
    //   accountName: null,
    //   email: null,
    //   password: null,
    //   passwordConfirm: null,
    // };

    let random = Math.round(Math.random() * 100);
    $scope.registerForm = {
      // accountName: "pouetweb" + random,
      // email: `nkogoh+pouet${random}@gmail.com`,
      // password: "pouetpouet",
      // passwordConfirm: "pouetpouet",
      accountName: null,
      email: null,
      password: null,
      passwordConfirm: null,
    };

    $scope.register = () => {
      let {accountName, email, password, passwordConfirm} = $scope.registerForm;
      formFactory.resetAllForms();
      accountFactory.register(accountName, email, password, passwordConfirm).then((res) => {
        $rootScope.setAlert('success', 'Vous allez bientôt recevoir un mail pour activer votre compte.');
      }).catch($rootScope.handleError);
    };
  }
]);