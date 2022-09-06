/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('crpChatRoom', ['$rootScope', $rootScope => ({
  restrict: 'A',
  templateUrl: myLocalized.partials + 'crpChatRoom.html',
  scope: {
    socket: '=',
    data: '=',
    mute: '='
  },
  controller($scope, $element) {
    $scope.soundBank = {
      notif: new Audio(myLocalized.medias + "/tchat/sound/pop.mp3"),
      notifAlt: new Audio(myLocalized.medias + "/tchat/sound/pop2.mp3"),
      positive: new Audio(myLocalized.medias + "/tchat/sound/putip.mp3"),
      fail: new Audio(myLocalized.medias + "/tchat/sound/uh.mp3")
    };
    $scope.playSound = function (label) {
      if (!$scope.mute) {
        return $scope.soundBank[label].play();
      }
    };
    $scope.base = myLocalized.medias;
    $scope.villages = hensApp.villages;
    $scope.actionList = ['rpMessage', 'turnChange'];
    $scope.responseList = [];
    $element.keydown(function (e) {
      if (e.keyCode === 13) {
        const target = $(window.getSelection().anchorNode);
        if (target.hasClass('speech-wrapper') || target.parent().hasClass('speech-wrapper')) {
          document.execCommand('insertHTML', true, window.getSelection() + '<br><br>');
          return false;
        }
      }
    });

    $scope.showFiche = function (author) {
      $scope.selectedAuthor = author;
      $scope.char = author.chara;
      return $scope.showPerso = true;
    };
    $scope.hideFiche = () => $scope.showPerso = false;
    $scope.insertRpMessage = function (msg) {
      $scope.started = true;
      return $scope.responseList.push(msg);
    };

    $scope.sendMessage = function () {
      if ($scope.rpMessage.length > 0) {
        $scope.socket.emit('rpMessage', $scope.rpMessage);
        return $scope.rpMessage = '';
      } else {
        return console.log('Message trop court!');
      }
    };

    $scope.skipTurn = () => $scope.socket.emit('skipturn');

    $scope.generateEvent = () => $scope.socket.emit('generateEvent');

    $scope.updateModal = function () {
      if ([3, 4, 5, 6, 7].indexOf($scope.data.status) > -1) {
        $scope.showModal = true;
      } else {
        $scope.showModal = false;
      }
      if ($scope.data.status === 4) {
        $scope.pauseCount = 0;
        return $scope.data.users.forEach(function (user) {
          if (user.paused) {
            return $scope.pauseCount++;
          }
        });
      }
    };

    $scope.possibleActionsSelect = () => (() => {
      const result = [];
      for (let index = 0; index < $scope.data.users.length; index++) {
        const user = $scope.data.users[index];
        if (user.ID === $rootScope.info.user.ID) {
          if (index === $scope.data.turn) {
            $scope.isMyTurn = true;
          } else {
            $scope.isMyTurn = false;
          }
          const old = {
            isOwner: $scope.isOwner,
            canStart: $scope.canStart,
            canPause: $scope.canPause,
            canResume: $scope.canResume,
            canEnd: $scope.canEnd,
            isMyTurn: $scope.isMyturn
          };
          $scope.data.pauseDurationLeftFormat = Math.floor($scope.data.pauseDurationLeft / 60) + ' min';
          $scope.data.pauseDurationExt = `et ${$scope.data.pauseDurationLeft % 60} sec`;
          $scope.isOwner = $scope.data.owner.ID === user.ID;
          $scope.canStart = (!user.ready && (($scope.data.status === 3) || ($scope.data.owner.ID === user.ID)));
          $scope.canPause = !user.paused && (($scope.data.status === 2) || ($scope.data.status === 4));
          $scope.canResume = user.paused && ($scope.data.status === 5);
          $scope.canEnd = !user.voteEnd && (($scope.data.status === 2) || ($scope.data.status === 7));
          // sound notification #
          // turn change
          if ($scope.oldRoom) {
            if ($scope.oldRoom.users.length < $scope.data.users.length) {
              $scope.playSound('positive');
            }
            if ($scope.oldRoom.users.length > $scope.data.users.length) {
              $scope.playSound('fail');
            }
            if ($scope.oldRoom.msg.length !== $scope.data.msg.length) {
              $scope.playSound('positive');
            }
            if (($scope.oldRoom.status === 4) && ($scope.data.status === 2)) {
              $scope.playSound('fail');
            }
            if (($scope.oldRoom.status === 2) && ([4, 5, 6, 7].indexOf($scope.data.status) > -1)) {
              $scope.playSound('positive');
            }
            if (([4, 5, 6, 7].indexOf($scope.oldRoom.status) > -1) && ($scope.data.status === 2)) {
              $scope.playSound('fail');
            }
            if (([0, 1].indexOf($scope.oldRoom.status) > -1) && ($scope.data.status === 3)) {
              $scope.playSound('positive');
            }
            if (($scope.oldRoom.status === 3) && ($scope.data.status < 2)) {
              result.push($scope.playSound('fail'));
            } else {
              result.push(undefined);
            }
          } else {
            result.push(undefined);
          }
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();

    $scope.possibleActionsSelect();

    $scope.startRP = () => $scope.socket.emit('userReady');

    $scope.refuseStart = () => $scope.socket.emit('userNotReady');

    $scope.setPause = () => $scope.socket.emit('pause');

    $scope.refusePause = () => $scope.socket.emit('notPause');

    $scope.setResume = () => $scope.socket.emit('resume');

    $scope.endRoom = () => $scope.socket.emit('endRoom');
    $scope.refuseEnd = () => $scope.socket.emit('notEndRoom');

    $scope.saveRoom = visibility => $scope.socket.emit('saveRoom', visibility);

    $scope.$on('onRepeatLast', function () {
      const elt = $('.page-container');
      return elt.scrollTop(elt[0].scrollHeight);
    });

    $scope.socket.on('rpMessage', msg => $scope.insertRpMessage(msg));

    $scope.socket.on('room:update', function (room) {
      $scope.oldRoom = $scope.data;
      $scope.data = room;
      $scope.updateModal();
      return $scope.possibleActionsSelect();
    });

    return $scope.$on('$locationChangeStart', function (event) {
      if ($scope.data.status >= 2) {
        const answer = confirm("Voulez vous vraiment quitter cette partie?");
        if (!answer) {
          return event.preventDefault();
        }
      }
    });
  }
})

]);
