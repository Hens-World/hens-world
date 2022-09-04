/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.factory('socket', function ($rootScope) {
  let socket = io;
  return {
    connect() {
      socket = socket(hensApp.socketUrl);
      socket.on('connect', function (data) {
        $rootScope.socketConnected = true;
      });

      socket.on('reconnect', function (data) {
        $rootScope.socketConnected = true;
        $rootScope.setAlert("success", "server01");
      });

      socket.on('connect:confirm', () =>{
        $rootScope.socketConnected = true;
      } );

      socket.on('connect_error', data => {
        $rootScope.setAlert('error', 'server01')
      });
      return socket.on('disconnect', function (data) {
        if (!$rootScope.currentUser) {
        } else if (data === 'io server disconnect') {
          $rootScope.setAlert('error', 'server02');
        } else {
          $rootScope.setAlert('error', 'server01');
        }
      });
    },

    on(eventName, callback) {
      return socket.on(eventName, function () {
        const args = arguments;
        if (!$rootScope.$$phase) {
          if (!$rootScope.$apply) {
            debugger;
          }
          $rootScope.$apply(() => callback.apply(socket, args));
        } else {
          callback.apply(socket, args);
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
    isConnected() {
      return socket.connected;
    },

    removeEventListener(key, fn) {
      return socket.off(key, fn);
    }
  };
});

hensApp.factory('globalChat', function ($rootScope) {
  let socket = null;
  return {
    connect() {
      console.log('connecting global chat');
      if ((socket == null)) {
        socket = io(hensApp.socketUrl + '/global-chat');
      } else {
        socket.connect();
      }
    },
    disconnect() {
      return socket.disconnect();
    },
    on(eventName, callback) {
      socket.on(eventName, function () {
        const args = arguments;
        if (!$rootScope.$$phase) {
          $rootScope.$apply(() => callback.apply(socket, args));
        }
      });
    },
    emit(eventName, data, callback) {
      socket.emit(eventName, data, function () {
        const args = arguments;
        if (!$rootScope.$$phase) {
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        } else {
          if (callback) {
            callback.apply(socket, args);
          }
        }
      });
    }
  };
});

hensApp.factory('chatRp', function ($rootScope) {
  let socket = null;
  return {
    connect() {
      if ((socket == null)) {
        socket = io(hensApp.socketUrl + '/rp-chat');
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
    reconnect() {
      socket({'force new connection': true});
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
  };
});
