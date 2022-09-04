angular.module('app').factory('chatService', ['socket', 'globalChat', '$rootScope',
  function (socket, globalChat, $rootScope) {
    let connections = 0;
    let listenedTags = ['updateUsers', 'answerHistorique', 'logoutConfirm', 'activateStatus', 'joinSuccess',
      'chat message'];
    let callbacks = {
      'connect': []
    };
    let init = false;
    let listenersInit = false;
    let connecting;
    return {
      init(callback) {
        if (!init) {
          let onInit = () => {
            callbacks['connect'].push(callback);
            if (!connecting) {
              globalChat.connect();
              connecting = true;
              globalChat.on('connect', function () {
                $rootScope.chatConnected = true;
                if (!listenersInit) {
                  listenersInit = true;
                  listenedTags.forEach(function (tag) {
                    if (!callbacks[tag]) callbacks[tag] = [];
                    globalChat.on(tag, function () {
                      let argList = arguments;
                      callbacks[tag].forEach(cb => {
                        cb.apply(null, argList);
                      })
                    });
                  });
                }
                connecting = false;
                init = true;
                callbacks['connect'].forEach(function (cb) {
                  cb();
                });
              });
            }
          };
          if ($rootScope.socketConnected) {
            onInit();
          } else {
            let w = $rootScope.$watch('socketConnected', (n, o) => {
              if (n && n != o) {
                onInit();
                w();
              }
            });
          }
        } else {
          callback();
        }
      },

      activate() {
        globalChat.emit('activate');
      },
      disable() {
        globalChat.emit('desactivate');
      }, //Should not be used right now
      join(room) {

      },
      emit(tag, ...args) {
        globalChat.emit(tag, ...args);
      },
      on(tag, callback) {
        if (!callbacks[tag]) callbacks[tag] = [];
        callbacks[tag].push(callback);
        return () => {
          callbacks[tag].splice(callbacks[tag].indexOf(callback), 1);
        }
      },
    }
  }]);