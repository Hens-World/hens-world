angular.module('app').component('profileCompteSideMenu', {
  templateUrl: myLocalized.partials + 'profileCompteSideMenu.html',
  controllerAs: 'ctrl',
  bindings: {},
  controller: [ '$scope', '$element', '$rootScope',
    function ($scope, $element, $rootScope) {
      this.$onInit = ()=>{
        this.menuList = [
          {
            label: "Résumé du profil",
            tag: "resume"
          }, {
            label: "Créations postées",
            tag: "creations"
          }, {
            label: "Séries de créations",
            tag: "series"
          }
        ];
        this.state = this.menuList[0];
      };

      $rootScope.$on('compte-side-menu:update', (event, btn)=>{
        this.state = btn;
      });

      $rootScope.$on('compte-side-menu:request', (event, btn)=>{
        $rootScope.$broadcast('compte-side-menu:set', this.state);
      });

      this.menuClick = (btn) =>{
        this.state = btn;
        $rootScope.$broadcast('compte-side-menu:set', btn);
      };
    }
  ]
});