angular.module('app').controller('Dialogue', [
  '$rootScope', '$scope', 'dialogueFactory', '$routeParams', '$location', 'eventsFactory',
  function ($rootScope, $scope, dialogueFactory, $routeParams, $location, eventsFactory) {
    $scope.$parent.info.isAppInit = false;

    $scope.setTime = function () {
      $scope.d = new Date();
      $scope.hour = $scope.d.getHours();
      $scope.day = $scope.d.getDate();
      $scope.month = $scope.d.getMonth() + 1;
      const d = $scope.day;
      const m = $scope.month;
      if (hensApp.isDateBetween([d, m], [1, 1], [20, 3]) || ((m === 12) && (d >= 21))) {
        $scope.season = "hiver";
      } else if (hensApp.isDateBetween([d, m], [21, 3], [20, 6])) {
        $scope.season = 'printemps';
      } else if (hensApp.isDateBetween([d, m], [21, 6], [20, 9])) {
        $scope.season = 'ete';
      } else if (hensApp.isDateBetween([d, m], [21, 9], [20, 12])) {
        $scope.season = "hiver";
        // $scope.season = 'automne';
      }

      if (($scope.hour >= 21) || ($scope.hour < 7)) {
        return $scope.mapTime = "nuit";
      } else {
        return $scope.mapTime = "jour";
      }
    };

    $scope.setTime();
    $scope.moods = {
      "-1": "sad",
      "0": "neutral",
      "1": "happy"
    };
    $scope.characters = [
      {
        id: 1,
        slug: 'ellire',
        name: 'Ellire',
        default_village: 'sulimo'
      }, {
        id: 2,
        slug: 'aulne',
        name: 'Aulne',
        default_village: 'wilwar'
      }, {
        id: 3,
        slug: 'puck',
        name: 'Puck',
        default_village: 'wilwar'
      }, {
        id: 4,
        slug: 'anatole',
        name: 'Anatole',
        default_village: 'anar'
      }, {
      id: 5,
        slug: 'nawja',
        name: 'Nawja',
        default_village: 'sulimo'
      }
    ];
    $scope.currentCharacter = $scope.characters.find(character => character.slug === $routeParams.character);
    $scope.village = $location.search().village ? $location.search().village : $scope.currentCharacter.default_village;

    $scope.init = () => {
      dialogueFactory.getNextDialogue($scope.currentCharacter.id).then((data) => {
        if (data.data) {
          $scope.dialogue = data.data;
          $scope.dialogue.reponses = hensApp.shuffleArray($scope.dialogue.reponses);
        }
        $scope.$parent.info.isAppInit = true;
      }).catch($rootScope.handleError);
    };

    $scope.sendReponse = (reponse) => {
      //home action is fake answer, and sends back to landing page
      if (reponse.action === 'home') {
        return $location.path('/map');
      }
      reponse.character_id = $scope.dialogue.character_id;
      dialogueFactory.postReponse(reponse).then(data => {
        let nextAction = reponse.action;
        if (nextAction) {
          switch (nextAction) {
            case 'horoscope':
              $location.path('/signe-zodiaque');
              break;
            case 'home':
              $location.path('/map');
              break;
            case 'equinoxe_graine':
              $location.path('/events/aulne-papier');
              break;
            case 'dino_discret':
              eventsFactory.carnavalCachette.unlockSecret().then(res => {
                $rootScope.setAlert('success', 'Vous obtenez de nouveaux déguisements pour vos parties... Ils sont différents selon les villages... mais qu\'est-ce que c\'est ? ');
                $location.path('/map');
              }).catch($rootScope.handleError);
              break;
            case 'give_lantern':
              $rootScope.setAlert('success', "Tu obtiens des lanternes, fais en bon usage et illumine le ciel d'Anar !");
              $location.path('/map');
              break;
            case 'curse_rank':
              eventsFactory.halloweenPumpkins.obtainCurse().then(res => {
                $rootScope.setAlert('error', 'Vous avez obtenu un nouveau rang ... ');
                $location.path('/map');
              }).catch($rootScope.handleError);
              break;
            case 'unlock_white_theme':
              eventsFactory.halloweenPumpkins.obtainBlessing().then(res =>{
                $rootScope.setAlert('success', 'Vous avez débloqué un nouveau thème secret !');
                $location.path('/map');
              }).catch($rootScope.handleError);
              break;
            default:
              console.warn('no action found for dialogue', nextAction);
          }
        } else {
          $scope.init();
        }
      }).catch($rootScope.handleError);
    };

    $scope.init();

  }
]);