angular.module('app').component('globalComponents', {
  templateUrl: myLocalized.specPartials + 'globalComponents.html',
  controllerAs: 'globCtrl',
  controller: [
    '$scope', '$element', '$rootScope', 'accountFactory', function ($scope, $element, $rootScope, accountFactory) {

      this.currentUser = $rootScope.currentUser;
      $rootScope.$watch('currentUser', (n, o) => {
        if (n && n != o) {
          this.currentUser = n;
        }
      });

      this.forgotPassword = {
        email: null
      };

      $rootScope.$on('toggleForgotPassword', ()=>{
        console.log('toggle forgot password receive');
        this.toggleForgotPassword();
      });

      this.sendForgotPassword = () => {
        accountFactory.sendForgotPasswordRequest(this.forgotPassword.email).then(() => {
          $rootScope.setAlert('success', 'Un mail a été envoyé à votre adresse pour réinitialiser votre mot de passe.');
          this.forgotPassword.email = null;
          this.toggleForgotPassword(false);
        }).catch($rootScope.handleError);
      };


      this.toggleForgotPassword = (boolean) => {
        this.showForgotPassword = boolean != null ? boolean : !this.showForgotPassword;
      };


      $scope.$on('$routeChangeStart', function () {
        this.showNoAccess = false;
      });
    }
  ]
});