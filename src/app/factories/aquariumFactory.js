angular.module('app').factory('aquariumSocket', ['$rootScope', function($rootScope){
  let socket = null;
  return {
    connect() {
      if ((socket == null)) {
        socket = io(hensApp.socketUrl + '/aquarium');
      } else {
        socket.connect();
      }
    },
    disconnect() {
      const list = ['message', 'joinVillageOk', 'errorApp', 'roomJoinOk', 'roomKick', 'toHome', 'globalHistory',
        'disconnect'];
      for (let event of Array.from(list)) {
        if (socket.hasListeners(event)) {
          socket.removeAllListeners(event);
        }
      }

      return socket.disconnect();
    },
    on(eventName, callback) {
      return socket.on(eventName, function () {
        const args = arguments;
        if (!$rootScope.$$phase) {
          return $rootScope.$apply(() => callback.apply(socket, args));
        } else {
          return callback.apply(socket, args);
        }
      });
    },

    emit(eventName, data, callback) {
      return socket.emit(eventName, data, function () {
        const args = arguments;
        if (!$rootScope.$$phase) {
          return $rootScope.$apply(function () {
            if (callback) {
              return callback.apply(socket, args);
            }
          });
        } else {
          if (callback) {
            return callback.apply(socket, args);
          }
        }
      });
    },
    removeAllListeners() {
    }
  }
}]);