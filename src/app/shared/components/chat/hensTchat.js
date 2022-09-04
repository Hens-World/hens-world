/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive("hensTchat", [
  "userFactory", "$rootScope", "chatService", function (userFactory, $rootScope, chatService) {
    return {
      restrict: "A",
      templateUrl: myLocalized.partials + "hensTchat.html",
      scope: {
        mode: '@', // full-screen |
        info: '='
      },
      controller: [
        "$scope", "$element", function ($scope, $element) {

          $scope.toggleShowEmotes = () => {
            $scope.showEmotes = !$scope.showEmotes;
          };

          $scope.emotes = [
            "shock", "admiring", "blush", "nostalgia",

            "happy", "upset", "sad", "neutral",

            "wink", "sick", "yum", "yawn",

            "laugh", "angry", "party", "sob",

            "sulimoheart", "sulimo", "cloud", "autumn",

            "ulmoheart", "ulmo", "water", "winter",

            "wilwarheart", "wilwar", "plant", "spring",

            "anarheart", "anar", "fire", "summer",
          ];
          $scope.insertEmote = (emote) => {
            $scope.currentMsg += ":" + emote + ":";
            $scope.toggleShowEmotes();
            $element[0].querySelector("#m").focus();
          };

          $scope.redux = true;
          $scope.invisible = false;
          $scope.chatSocketLaunched = false;
          $scope.status = false;
          $scope.currentTchat = "";
          $scope.notifNb = 0;
          $scope.currentMsg = "";
          $scope.lastMsg = 0;
          $scope.notif = new Audio(myLocalized.medias + "/tchat/sound/sound.mp3");
          $scope.notif.volume = .09;
          $scope.notif2 = new Audio(myLocalized.medias + '/tchat/sound/drop.mp3');
          $scope.userList = [[]];
          $scope.channels = ['global'];
          $scope.currentChannel = 0;
          $scope.historique = [[]];
          $scope.showUserList = false;
          $scope.subscriptions = [];

          $scope.scrollContainer = $element[0].querySelector('#tchat-content');
          let lastScrollTop;
          $scope.scrollContainer.addEventListener('scroll', (e) => {
            if (lastScrollTop) {
              const st = $element.find('.tchat-content').scrollTop();
              const sh = $element.find('.tchat-content')[0].scrollHeight;
              const mh = $('.message-container').last().height();
              if ((($element.find('.tchat-content').height() + 20 + mh) >= (sh - st))) {
                if (lastScrollTop < $scope.scrollContainer.scrollTop) {
                  $element.find('.tchat-content').scrollTop(sh);
                }
                $scope.showNotice = false;
              }
            }
            lastScrollTop = $scope.scrollContainer.scrollTop;
          });

          $scope.updateWriteContainerSize = (n, o) => {
            let container = document.querySelector('.write-container');
            let area = container.querySelector('textarea');
            if (area.scrollHeight > area.offsetHeight) {
              let currentHeight = parseInt(container.style.getPropertyValue('--writeHeight'));
              if (!currentHeight || isNaN(currentHeight)) {
                currentHeight = 21;
              }
              if (currentHeight > 75) {
                currentHeight = 75
              }
              container.style.setProperty('--writeHeight', currentHeight + 21 + "px");
            }
            if (n.length < o.length) {
              container.style.setProperty('--writeHeight', 1 + "px");
              area.value = n;
              container.style.setProperty('--writeHeight', Math.min(75, Math.max(25, area.scrollHeight)) + "px");
            }
          };

          $scope.$watch('currentMsg', (n, o) => {
            if (n != o) {
              $scope.updateWriteContainerSize(n, o);
              $scope.updateSuggestedEmotes(n);
            }
          });

          $scope.content = {global: 'Bienvenue sur le tchat global!'};
          $rootScope.$watch('tchatInfo', function (n, o) {
            if (n !== o) {
              if ($rootScope.tchatInfo.tchatOpen && !$scope.status) {
                return $scope.openTchat();
              }
            }
          });

          $scope.toggleUserList = () => $scope.showUserList = !$scope.showUserList;

          $scope.notifTrigger = function () {
            $scope.notif.play();
            $scope.notif2.play();
            return $scope.notifNb++;
          };

          $scope.updateUsers = list => {
            for (let channelKey in list) {
              let channel = list[channelKey];
              channel.forEach(newUser => {
                let existingUser = $scope.userList[$scope.currentChannel].find(eu => eu.ID === newUser.ID);
                if (existingUser) {
                  newUser.lastActivityTime = existingUser.lastActivityTime;
                  newUser.away = existingUser.away;
                } else {
                  newUser.lastActivityTime = new Date();
                }
              });
            }
            $scope.userList = list;
          };

          $scope.openTchat = function () {
            $scope.redux = false;
            $scope.notifNb = 0;
            if (!$scope.status) {
              $scope.activating = true;
              chatService.activate();
            }
            setTimeout(function () {
              const sh = $element.find('.tchat-content')[0].scrollHeight;
              if ($element.find('.tchat-content').height() < sh) {
                return $element.find('.tchat-content').scrollTop(sh);
              }
            }, 50);
          };

          $scope.reduceTchat = function () {
            $scope.redux = true;
            $rootScope.tchatInfo.tchatOpen = false;
            $scope.position = null;
            $scope.notifNb = 0;
          };

          $scope.closeTchat = function () {
            $scope.redux = true;
            chatService.disable();
          };

          $scope.updateSuggestedEmotes = (msg) => {
            // if ()
            //TODO WEH
          };

          $scope.$on('onRepeatLast', function () {
            const st = $element.find('.tchat-content').scrollTop();
            const sh = $element.find('.tchat-content')[0].scrollHeight;
            const mh = $('.message-container').last().height();
            if ($scope.activating || ($element.find('.tchat-content').height() + 20 + mh) >= (sh - st)) {
              $element.find('.tchat-content').scrollTop(sh);
              $scope.showNotice = false;
              $scope.activating = false;
            } else {
              $scope.showNotice = true;
            }
          });

          $scope.goBottom = function () {
            $scope.showNotice = false;
            const sh = $element.find('.tchat-content')[0].scrollHeight;
            $element.find('.tchat-content').scrollTop(sh);
          };

          $scope.formatMessage = function (message) {
            let newMessage = "";
            const wordList = message.replace(/(?:\r\n|\r|\n)/g, '<br>').split(' ');
            //link generator
            wordList.forEach(function (word) {
              if ((word.indexOf('http://') >= 0) || (word.indexOf('https://') >= 0)) {
                const link = word;
                word = word.replace('https', '')
                  .replace('http', '')
                  .replace('http', '')
                  .replace('://', '')
                  .replace('www.', '');
                return newMessage +=
                  `<a class=\"font-village hover link\" target=\"_blank\" href=\"${link}\">${word}</a> `;
              } else {
                return newMessage += word + " ";
              }
            });

            //emote generator
            let matches = [...newMessage.matchAll(/\:([a-z]{3,})\:/g)];
            if (matches.length > 0) {
              matches.forEach(match => {
                if ($scope.emotes.includes(match[1])) {
                  newMessage =
                    newMessage.replace(match[0], `<img class="paragraph-emote" src="/medias/chat/emotes/${match[1]}.png" />`);
                }
              });
            }
            return newMessage;
          };

          $scope.writeMessage = function (user, message, type, time, id) {
            // link handling
            message = $scope.formatMessage(message);
            if (!time) {
              time = new Date();
            }
            const msgObj = {
              timer: moment(time).format(hensApp.DATE_FORMATS.MIDDLE),
              user,
              message,
              type,
              id
            };

            $scope.historique[$scope.currentChannel].push(msgObj);
            if (user.ID) {
              let existingUser = $scope.userList[$scope.currentChannel].find(existingUser => existingUser.ID ===
                user.ID);
              existingUser.lastActivityTime = new Date();
            }
            return $scope.lastMsg = 0;
          };

          $scope.searchLastMsg = function () {
            const histo = $scope.historique[$scope.currentChannel];
            return (() => {
              const result = [];
              for (let index = histo.length - 1; index >= 0; index--) {
                const msg = histo[index];
                if (msg.user.id === $rootScope.currentUser.ID) {
                  if (index === e.lastMsg) {
                    $scope.currentMsg = msg.message;
                    result.push($scope.lastMsg++);
                  } else {
                    result.push(undefined);
                  }
                } else {
                  result.push(undefined);
                }
              }
              return result;
            })();
          };

          $element.find('#m').keypress(function (event) {
            console.log('keypress', event.which);
            if (event.which == '13' && !event.shiftKey) {
              $scope.submitForm();
              return false;
            }
          });

          $scope.submitForm = function () {
            if ($scope.currentMsg.length > 0) {
              chatService.emit('chat message', {
                msg: $scope.currentMsg,
                user: $rootScope.currentUser
              });
              setTimeout(() => {
                let old = $scope.currentMsg;
                $scope.currentMsg = "";
                $scope.updateWriteContainerSize("", old);

              });
            } else {
              hensApp.log('msg empty');
            }
          };

          $scope.sendMsg = () => {
            $scope.submitForm();
          };

          $scope.join = function (room) {
            hensApp.log(`trying to log into channel ${room}`);
            return chatService.join(room);
          };

          $scope.init = function () {
            if (!$scope.chatSocketLaunched) {
              $scope.launchEventListeners();
              if ($scope.mode === 'full-screen') {
                $scope.openTchat();
              }
            }
            //lors de la reco, si le status est déjà activé, relancer une activation
            else if ($scope.status == 1) {
              chatService.activate();
            }
          };

          $scope.launchEventListeners = function () {
            if (!$scope.chatSocketLaunched) {
              $scope.chatSocketLaunched = true;
              $scope.onActivateStatus = function (status) {
                console.warn('activate status', status);
                //TODO: move all actions herre
                $scope.status = status;
                if (status) {
                  const msg = "Prenez place à notre comptoir pour discuter avec les Hensiens!";
                  $scope.writeMessage({
                    display_name: 'Barman'
                  }, msg);
                }
              };
              $scope.chatServiceOn('activateStatus', $scope.onActivateStatus);

              $scope.onChatMessage = function (message, user, time, type, id) {
                $scope.writeMessage(user, message, type, time, id);
                if ((user.display_name !== $rootScope.currentUser.display_name && user.display_name != "Barman") &&
                  $scope.status) {
                  return $scope.notifTrigger();
                }
              };
              $scope.chatServiceOn('chat message', $scope.onChatMessage);

              $scope.chatServiceOn('logoutConfirm', (user, userList) => {
                $scope.updateUsers(userList)
              });

              $scope.chatServiceOn('answerHistorique', (room, histo) => {
                histo.forEach((msg, index) => {
                  let existingMessage = $scope.historique[room].find(histoMessage => histoMessage.id === msg[4]);
                  if (!existingMessage || msg[4] == null) {
                    $scope.historique[room].push({
                      message: $scope.formatMessage(msg[0]),
                      user: msg[1],
                      timer: moment(msg[2]).format(hensApp.DATE_FORMATS.MIDDLE),
                      type: msg[3],
                      id: msg[4]
                    });
                  } else {
                    // TODO update message
                  }
                })
              });

              $scope.chatServiceOn('updateUsers', userList => {
                $scope.updateUsers(userList);
              });
              $(window).keydown(function (e) {
                $scope.safeApply(() => {
                  if ((e.which === 38) && ($(e.target).attr('id') === "m")) {
                    $scope.searchLastmsg();
                  }
                  if ((e.which === 40) && ($(e.target).attr('id') === "m")) {
                    $scope.lastMsg = $scope.lastMsg - 2;
                    if ($scope.lastMsg >= 0) {
                      $scope.searchLastMsg();
                    } else {
                      $scope.lastMsg = 0;
                      $scope.currentMsg = "";
                    }
                  }
                });
              });
              $scope.activityInterval = setInterval(() => {
                $scope.safeApply(() => {
                  $scope.userList[$scope.currentChannel].forEach(user => {
                    //more than 30 min;
                    user.away = (+new Date() - +user.lastActivityTime) > (30 * 60 * 1000);
                  });
                })
              }, 60 * 1000);
            }
          };

          $scope.chatServiceOn = (tag, callback) => {
            chatService.on(tag, function () {
              var args = arguments;
              $scope.safeApply(() => {
                callback.apply(null, args);
              });
            });
          };

          /**
           * INIT IS HERE
           */
          if ($rootScope.currentUser) {
            chatService.init(() => {
              $scope.init();
            });
          } else {
            let w = $rootScope.$watch('currentUser', (n, o) => {
              if (n && n != o) {
                chatService.init(() => {
                  $scope.init();
                });
                w();
              }
            })
          }

          //Gestion drag & drop
          $('body').on('mousemove', (e) => {
            $scope.safeApply(function () {
              if ($scope.dragging) {
                $scope.updatePosition(event.pageX, event.pageY);
              }
            });
          });

          $('body').on('mouseup', (e) => {
            $scope.safeApply(function () {
              if ($scope.dragging) {
                $scope.dragging = false;
                $scope.updatePosition(event.pageX, event.pageY);
              }
            });
          });

          $scope.startDrag = (event) => {
            $scope.dragging = true;
          };

          $scope.updatePosition = (x, y) => {
            x = x - $('.drag-n-drop').width() / 2;
            y = y - $('.drag-n-drop').height() / 2;
            let pageHeight = $('body').height();
            let pageWidth = $('body').width();
            let chatWidth = $('.inner-tchat-container').width();
            $scope.position = {
              left: x > (pageWidth - chatWidth) ? (pageWidth - chatWidth) : (x < 30 ? 30 : x),
              top: y > pageHeight - 200 ? pageHeight - 200 : (y < 80 ? 80 : y)
            };
            $scope.dragStyle = {
              left: `margin-left:0; left: ${$scope.position.left}px;`,
              top: `height:calc(100vh - ${$scope.position.top}px);`
            };
          };

          $scope.$on('$routeChangeSuccess', function ($event, next, current) {
            if (next.originalPath == '/tchat' && $scope.mode != 'full-screen') {
              $scope.invisible = true;
            } else {
              $scope.invisible = false;
            }
          });

          $scope.$on('$destroy', () => {
            $scope.subscriptions.forEach(subscription => {
              clearInterval($scope.activityInterval);
              subscription();
            });
          });

          $scope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
              if (fn && (typeof (fn) === 'function')) {
                fn();
              }
            } else {
              this.$apply(fn);
            }
          };
        }
      ]
    }
  }
]);
