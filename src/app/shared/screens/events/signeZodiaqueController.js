angular.module('app').controller('SigneZodiaque', [
  '$rootScope', '$scope', 'eventsFactory', '$location', function ($rootScope, $scope, eventsFactory, $location) {
    $scope.$parent.info.isAppInit = false;
    $scope.birthday = null;
    $scope.state = 'loading';
    $scope.months = hensApp.c.months;
    eventsFactory.signeZodiaque.get().then(data => {
      let reponse = data.data;
      switch (reponse.state) {
        case 'talk_ellire':
          $location.url('/dialogues/ellire');
          break;
        case 'need_date':
          $scope.state = 'pickingDate';
          break;
        case 'has_prediction':
          $scope.state = 'signe';
          $scope.signe = reponse.signe;
          break;
      }
      $scope.$parent.info.isAppInit = true;
    }).catch($rootScope.handleError);
    $scope.$parent.info.isAppInit = true;
    $scope.sendBirthday = () => {
      eventsFactory.signeZodiaque.askSign({
        birthday: moment($scope.birthday).format('DD/MM/YYYY')
      }).then(data => {
        $scope.state = 'signe';
        $scope.signe = data.data.signe;
        $scope.signe.prediction = data.data.prediction;
        $rootScope.setAlert('success', 'Vous avez obtenu le rang de votre signe astrologique "' + data.data.signe.animal_slug + '" !');
      }).catch($rootScope.handleError);
    };
    $scope.goToPrediction = () => {
      $scope.state = "loading";
      setTimeout(() => {
        $scope.state = 'prediction';
      }, 3000);
    }
  }
]);