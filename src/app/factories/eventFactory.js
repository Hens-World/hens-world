hensApp.factory('eventsFactory', [
  '$http', '$rootScope', function ($http, $rootScope) {
    const declareRoute = hensApp.declareFactoryRoute('events', $http, $rootScope);
    return {
      getCurrentEvent(){
        return declareRoute('get', "/current");
      },
      pray(village){
        return declareRoute('post', "/temple/" + village);
      },
      halloweenPumpkins: {
        get() {
          return declareRoute('get', "/halloween-pumpkins/");
        },
        getLeft(village, zone, quartier) {
          let route = `/halloween-pumpkins/left?village=${village}&zone=${zone}`;
          if(quartier) {
            route += `&quartier=${quartier}`;
          }
          return declareRoute('get', route);
        },
        create(pumpkin_id, village, zone ,quartier) {
          console.log('creating pumpking find', pumpkin_id, village, zone, quartier);
          return declareRoute('post', '/halloween-pumpkins/', {
            pumpkin_id,
            village,
            zone,
            quartier
          });
        },
        getFirst() {
          return declareRoute('get', "/halloween-pumpkins/start");
        },
        obtainCurse() {
          return declareRoute('post', "/halloween-pumpkins/curse", {});
        },
        obtainBlessing() {
          return declareRoute('post', "/halloween-pumpkins/bless", {});
        }
      },
      signeZodiaque: {
        get() {
          return declareRoute('get', "/signe-zodiaque/");
        },
        askSign(date) {
          return declareRoute('post', "/signe-zodiaque/birthday", date);
        }
      },
      equinoxePrintemps: {
        getCurrentSeeds() {
          return declareRoute('get', "/equinoxe-printemps/field");
        },
        /**
         * tries to plant a seed on a given tile.
         * @param data {x:number, y: number}
         * @returns {*}
         */
        plantSeed(data){
          return declareRoute('post', "/equinoxe-printemps", data);
        },
        getMissingSeeds(){
          return declareRoute('get', "/equinoxe-printemps/missing");
        },
        getMySeeds(){
          return declareRoute('get', "/equinoxe-printemps/my-seeds");
        },
        getSolutionNote(){
          return declareRoute('get', "/equinoxe-printemps/solution");
        }
      },
      carnavalCachette: {
        unlockSecret(){
          return declareRoute('post', "/carnaval-cachette/secret", {});
        }
      },
      solsticeEte: {
        getLanterns(quartier){
          return declareRoute('get', `/solstice-ete?quartier=${quartier}`);
        },
        createLantern(lanternData){
          return declareRoute('post', "/solstice-ete/", lanternData);
        },
        getLanternsLeft(){
          return declareRoute('get', "/solstice-ete/left");
        }
      },
      coupeCrushrun: {
        getVillageScores() {
          return declareRoute('get', "/coupe-crushrun/scores");
        }
      },
      equinoxeAutomne: {
        getCurrentMusics() {
          return declareRoute('get', '/equinoxe-automne/');
        },
        getCurrentMusic(instrument) {
          return declareRoute('get', '/equinoxe-automne/instrument/' + instrument);
        },
        postMusic(instrument, partition) {
          partition.instrument = instrument;
          return declareRoute('post', '/equinoxe-automne/', partition);
        }
      },
      solsticeUlmo: {
        getPoissons() {
          return declareRoute('get', '/solstice-hiver/');
        },
        getLogs() {
          return declareRoute('get', '/solstice-hiver/logs');
        },
        getCreationInfos() {
          return declareRoute('get', '/solstice-hiver/creation-infos');
        },
        getData() {
          return declareRoute('get', '/solstice-hiver/const');
        },
        createPoisson(poisson) {
          return declareRoute('post', '/solstice-hiver/', poisson);
        },
        feedPoisson(poisson_id) {
          return declareRoute('put', '/solstice-hiver/' + poisson_id, {action: 'FEED'});
        },
        favorPoisson(poisson_id) {
          return declareRoute('put', '/solstice-hiver/' + poisson_id, {action: 'FAVOR'});
        },
        getMyStatus() {
          return declareRoute('get', '/solstice-hiver/inventory');
        }
      }
    };
  }
]);