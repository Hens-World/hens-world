angular.module('app').factory('calendrierFactory', [
  '$http', '$rootScope', function ($http, $rootScope) {
    const declareRoute = hensApp.declareFactoryRoute('events', $http, $rootScope);
    return {
      getEvents() {
        return declareRoute('get', '/');
      }
    };
  }
]);