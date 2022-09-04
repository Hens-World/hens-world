angular.module('app').factory('cachetteSocket', [
  '$rootScope', function ($rootScope) {
    let socket = null;
    const eventList = [];

    return {
      isConnected(){
        return socket && socket.connected;
      },
      connect() {
        if ((socket == null)) {
          socket = io(hensApp.socketUrl + '/cachette');
        } else {
          socket.connect();
        }
      },
      disconnect() {
        for (let event of Array.from(eventList)) {
          if (socket.hasListeners(event)) {
            socket.removeAllListeners(event);
          }
        }
        return socket.disconnect();
      },
      on(eventName, callback) {
        eventList.push(eventName);
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
        for (let event of Array.from(eventList)) {
          if (socket.hasListeners(event)) {
            socket.removeAllListeners(event);
          }
        }
      }
    }
  }
]);