hensApp.factory('PropActions', [
  'eventsFactory', '$rootScope', '$location', (eventsFactory, $rootScope, $location) => ({
    pumpkin_find: (prop, village, zone, quartier) => {
      console.log('finding pumpkin on ', prop.label, village);
      eventsFactory.halloweenPumpkins.create(prop.label, village, zone, quartier).then((res, status) => {
        let message;
        if (res.data.leftInVillage === 0 && res.data.left > 0) {
          message =
            "Vous avez trouvé toutes les citrouilles présentes sur cette carte ! Il vous reste encore " +
            res.data.left + " citrouilles à trouver !"
        } else {
          if (res.data.left > 0) {
            message = `Citrouille trouvée ! Plus que ${res.data.left} à chasser !`;
            if (res.data.exists) {
              message =
                res.data.left ? "Vous avez déjà trouvé cette citrouille, encore " + res.data.left + " à trouver !" :
                  "Vous avez déjà trouvé toutes les citrouilles !";
            }
          } else {
            $rootScope.$broadcast('halloween_complete', res.data);
          }
        }
          if(res.data.left > 0 ){
            $rootScope.$broadcast('halloween_feed', {
              msg: message,
              left: res.data.left
            });
        }
        // $rootScope.setAlert('success', message, 100);
      }).catch($rootScope.handleError);
    },
    open_horoscope: (prop, village, zone, quartier) => {
      $location.url("/dialogues/ellire?village=" + village);
    },
    talk_aulne: (prop, village, zone, quartier) => {
      $location.url("/dialogues/aulne");
    },
    jardin_equinoxe: (prop, village, zone, quartier) => {
      $location.url('events/equinoxe-printemps');
    },
    talk_nawja: (prop, village, zone, quartier) => {
      $location.url('/dialogues/nawja');
    },
    open_secret_carnaval: (prop, village, zone, quartier) => {
      $location.url('dialogues/puck?village=' + village);
    },
    open_anatole_dialogue: (prop, village, zone, quartier) => {
      $location.url('dialogues/anatole?village=' + village);
    },
    open_equinoxe_instrument: (prop, village, zone, quartier) => {
      return prop.label.split('_')[0];
    },
  })

]);