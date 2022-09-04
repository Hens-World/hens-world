angular.module('app').component('globalComponents', {
  templateUrl: myLocalized.specPartials + 'globalComponents.html',
  controllerAs: 'globCtrl',
  controller: [
    '$scope', '$element', '$rootScope', function ($scope, $element, $rootScope) {

      $rootScope.$on('bottomNav:select', (event, button) => {
        this.selectedButton = button;
      });

      this.bottomButtons = [

        {
          name: "Navbar",
          visible: true,
          image: "navigation.png",
          link: "/navbar",
        }, {
          name: "Monde",
          disabled: false,
          visible: true,
          image: "map.png",
          link: "/map",
        }, {
          name: "Guide",
          disabled: false,
          image: "guide.png",
          visible: true,
          link: "/guide-touristique",
        }, {
          name: "Tchat",
          visible: true,
          image: "tchat.png",
          link: "/tchat",
        }, {
          name: "Poster",
          image: "poster.png",
          disabled: false,
          visible: true,
          link: "/panneau-creation",
        }, {
          name: "Connexion",
          disabled: false,
          image: "connexion.png",
          visible: false,
          link: "/",
        },
      ];

      this.updateButtonVisibility = () => {
        this.bottomButtons.filter(b => ["Tchat", "Poster", "Connexion"].includes(b.name)).map(b => {
          b.visible = !!this.currentUser;
          if (b.name === "Connexion") {
            b.visible = !this.currentUser;
          }
        });
      };

      this.currentUser = $rootScope.currentUser;
      this.updateButtonVisibility();
      $rootScope.$watch('currentUser', (n, o) => {
        if (n && n != o) {
          this.currentUser = n;
          this.updateButtonVisibility();
        }
      });

    }
  ]
});