hensApp.factory('pushFactory', [
  '$rootScope', '$location', '$http', function ($rootScope, $location, $http) {
    const declareRoute = hensApp.declareFactoryRoute('push', $http, $rootScope);

    return {
      getAuthorization() {
        return declareRoute('get', '/');
      },

      createAuthorization(subscription) {
        return declareRoute('post', '/', subscription);
      }
    }
  }
]);
