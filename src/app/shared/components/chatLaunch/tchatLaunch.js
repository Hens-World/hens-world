/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive("tchatLaunch", ["$rootScope", "$http", "$compile", ($rootScope, $http, $compile)=>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + "tchatLaunch.html",
    scope: {
      locaSlug: '=',
      village: '='
    },
    controller: ["$scope", "$element", function($scope,$element){
      $scope.animIndex = 0;
      $scope.locaToChannel = {
        "eau_peine_bar-ulmo": 1,
        "coquelicot-wilwar": 2,
        "taverne-sulimo": 0,
        "pote_au_feu": 3
      };


      $scope.content = {
        welcome: {
          wilwar: ' Bonjour, bienvenue au " Coquelicot ", notre beau café de Wilwar. Prenez place en terasse ou en interieur, nous vous servirons deux programmes différents. Merci de votre visite!',
          sulimo: ' Bienvenue à notre taverne, " Au Sire Occo ", on peut vous servir en terasse ou en interieur? Les programmes ne sont pas les mêmes, mais tout aussi succulants. Profitez de notre petit lieu rustique!',
          ulmo: "Bonjour! Prenez place à l'Eau peine bar, dehors ou dedans, c'est comme vous voulez. Mais notre menu n'est pas le même, choisissez ce qui vous convient!",
          anar: "Salut! Bienvenue au troquet, installez-vous où vous voulez et discutez au long de la journée, ici on vous régale midi et soir. Alors, qu'est-ce qui vous ferait plaisir?"
        },
        rooms: {
          salle: "Ce tchat un peu spécial verra le jour dans le courant de l'année. Ici vous pourrez incarner le personnage que vous avez créé sur Hens World. Préparez vous au rôle play!",
          terrasse: "Venez rencontrer la communauté sur le tchat global. Ici parlez de vos envies, vos humeurs, vos passions et apprenez à connaître la vie de ceux qui vous entourent!"
        }
      };


      $scope.hideArtiList = () => $scope.$parent.hideList();

      $scope.openTchat = function() {
        $scope.hideArtiList();
        if ($rootScope.currentUser) {
          return $rootScope.tchatInfo = {
            tchatOpen : true,
            channel: $scope.locaToChannel[$scope.locaSlug]
          };
        } else {
          return alert('no-access');
        }
      };
      $scope.adaptTchatButtons = function() {
        let spacew;
        const bt = $('.domaine-bt');
        const largew = 800;
        const largeh = 750;
        const container = $('.content-tchat-launch');
        const containerw = $(container).width();
        const containerh = $(container).height();
        if(containerh < largeh) {
          spacew = containerh;
        } else {
          spacew = containerh;
        }
        const finalvalue = containerh;
        const ratio = 1.9;
        const leftout = 180;
        const halflt = 20;
        const half = halflt / 2;
        const adjustw = spacew - 90;
        const btw = adjustw * .4;
        const btmargin = adjustw * .05;
        let bth = btw * ratio;
        const margin = largew - containerw;
        if (bth > (finalvalue - 180 - 20)) {
          bth = finalvalue - 180 - 20;
        }
        if (finalvalue < $('.tchat-launch-container').height()) {
          const margintop = $('.tchat-launch-container').height() - finalvalue;
          $(container).css('margin-top',margintop / 2);
        } else {
          $(container).css('margin-top',0);
        }
        $(container).css('margin-left',margin / 3);
        $(container).css('width',spacew);
        $(container).find('.banner-container').find('.text').css('margin-left',((spacew - 300) / 2) + "px");
        $(container).css('height',finalvalue);
        $(bt).css('width',btw);
        $(bt).css('height',bth);
        $(bt).css('margin-left',btmargin);
        return $(bt).css('margin-right', btmargin);
      };

      return setTimeout(function(){
        $scope.adaptTchatButtons();
        $scope.openTchat();
        return setInterval($scope.adaptTchatButtons,1000);
      }
      ,100);
    }
    ]
  })

]);
