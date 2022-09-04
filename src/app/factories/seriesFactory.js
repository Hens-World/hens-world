hensApp.factory('seriesFactory', [
  '$http', '$rootScope', function ($http, $rootScope) {
    const declareRoute = hensApp.declareFactoryRoute('series', $http, $rootScope);
    return {

      getMySeries() {
        return declareRoute('get', '/');
      },

      getSerieById(id) {
        return declareRoute('get', '/' + id);
      },

      searchByName(name) {
        return declareRoute('get', '/search/' + name);
      },
      getMyDrafts() {
        return declareRoute('get', '/drafts');
      },

      getSeriesByUserId(user_id) {
        return declareRoute('get', '/author/' + user_id);
      },

      createSerie(serieData) {
        return declareRoute('post', '/', serieData);
      },

      updateSerie(serieData) {
        return declareRoute('put', '/' + serieData.id, serieData);
      },

      deleteSerie(serie_id) {
        return declareRoute('delete', '/' + serie_id);
      }

    }
  }
]);