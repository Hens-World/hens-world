angular.module('app').component('profilePersoSideMenu', {
  templateUrl: myLocalized.partials + 'profilePersoSideMenu.html',
  controllerAs: 'persoMenuCtrl',
  controller: [ '$scope', '$element', '$rootScope',
    ($scope, $element, $rootScope) => {
      $scope.menuList = [
        {
          label: "Fiche de personnage",
          tag: "fiche"
        }, {
          label: "Relations",
          tag: "relations"
        }, {
          label: "Aventures",
          tag: "aventures"
        }, {
          label: "Créations liées",
          tag: "creations-liees"
        }
      ];

      $rootScope.$on('perso-side-menu:update', (event, btn)=>{
        $scope.state = btn;
      });

      $rootScope.$on('perso-side-menu:request', (event, btn)=>{
        $rootScope.$broadcast('perso-side-menu:set', $scope.state);
      });

      $scope.menuClick = (btn) =>{
        $scope.state = btn;
        $rootScope.$broadcast('perso-side-menu:set', btn);
      };

      $scope.state = $scope.menuList[0];
      $rootScope.$broadcast('perso-side-menu:set', $scope.state);
    }
  ]
});