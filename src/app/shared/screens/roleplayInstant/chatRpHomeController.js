/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('chatRpHome', [
  '$scope', 'chatRp', '$rootScope', '$compile', '$routeParams', '$location', 'localeFactory',
  function ($scope, chatRp, $rootScope, $compile, $routeParams, $location, localeFactory) {
    console.log('bienvenue dans le chat rp');
    $scope.$parent.info.isAppInit = false;
    $scope.socket = chatRp;
    $scope.globalList = []; // array containing all global chat msg
    $scope.mute = false;
    $scope.soundBank = {
      notif: new Audio(myLocalized.medias + "/tchat/sound/pop.mp3"),
      notifAlt: new Audio(myLocalized.medias + "/tchat/sound/pop2.mp3")
    };
    $scope.villages = hensApp.villages;
    // FUNCTIONS
    $scope.playSound = function (label) {
      if (!$scope.mute) {
        return $scope.soundBank[label].play();
      }
    };

    $scope.changeScreen = function (screen, data) {
      $('.rp-screen-container').empty();
      $scope.joined = false;
      if (screen === 'chat-room') { $scope.globalList = []; }
      const html = `<div crp-${screen} socket='socket' data='${data}' mute='mute' ></div>`;
      const el = $(html);
      const div = $compile(el)($scope);
      $('.rp-screen-container').prepend(div);
      setTimeout(() => $(".crp-chat-home-container").getNiceScroll().resize(), 150);
      return $scope.$parent.info.isAppInit = true;
    };

    $scope.toggleMute = () => $scope.mute = !$scope.mute;

    $scope.launchSocketEvents = function () {
      //both for global and instance msg
      $scope.initialized = true;
      $scope.socket.on('message', function (msgObj) {
        if ((msgObj.type !== 'system') && (msgObj.user !== $rootScope.info.user.username)) {
          $scope.playSound('notif');
        }
        return $scope.globalList.push(msgObj);
      });

      //join village action
      $scope.socket.on('joinVillageOk', function (village, locationList, roomList) {
        $scope.villageData = {
          locations: locationList,
          village,
          rooms: roomList
        };
        return $scope.changeScreen('village', 'villageData');
      });

      //every type of error gets sent here
      $scope.socket.on('errorApp', function (msg) {
        console.error(msg);
        return alert(msg);
      });

      $scope.location = $location;
      //join a room
      $scope.socket.on('roomJoinOk', function (roomInfo) {
        $scope.roomData = roomInfo;
        $scope.location.path(`/roleplay/chat/room/${$scope.roomData.roomId}`);
        return $scope.changeScreen('chat-room', 'roomData');
      });

      $scope.socket.on('roomKick', function () {
        $scope.globalList = [];
        $scope.changeScreen('home', '');
        return $scope.socket.emit('outOfRp');
      });

      $scope.socket.on('toHome', () => $scope.changeScreen('home', ''));

      $scope.socket.on('globalHistory', function (list) {
        $scope.globalList = list;
        return $scope.globalList.push({
          time: moment().format('HH:mm'),
          msg: 'Bienvenue sur le jeu de rôle instantané! Discutez ici avec les membres pour préparer vos parties.',
          type: 'system'
        });
      });
      return $scope.socket.on('disconnect', function () {
        $scope.socket.disconnect();
        $scope.connected = false;
        return $scope.initialized = false;
      });
    };

    $scope.graphicSetup = () => // $('.side-chat').find('.list').niceScroll hensApp.niceScrollOptions
      $(".crp-chat-home-container").niceScroll(hensApp.niceScrollOptions);

    $scope.sendMessage = function () {
      if ($scope.msgToSend.length > 0) {
        $scope.socket.emit('message', $scope.msgToSend);
        return $scope.msgToSend = '';
      }
    };

    $scope.init = function () {
      $scope.socket.connect();
      setTimeout($scope.graphicSetup, 100);
      if ($routeParams.roomid != null) {
        $scope.socket.emit('joinRolePlay', $routeParams.roomid);
      }
      if ($location.search().location) {
        localeFactory.JSON("guideInfo").then(function (locations) {
          $scope.locations = locations.data.list;
          const foundLoca = $scope.locations.find(loca => loca.slug === $location.search().location);
          return $scope.socket.emit('joinVillage', $scope.villages.indexOf(foundLoca.village));
        });
      } else {
        $scope.changeScreen('home');
      }

      if (!$scope.initialized) {
        $scope.launchSocketEvents();
      }
      $scope.initialized = true;
      return $scope.connected = true;
    };

    $rootScope.$watch('socketConnected', function (n, o) {
      if ((n !== o) && n && !$scope.connected) {
        return $scope.init();
      }
    });

    if ($rootScope.socketConnected) {
      $scope.init();
    }

    $scope.$on('onRepeatLast', function () {
      $('.side-chat .list').getNiceScroll().resize();
      const st = $('.side-chat .list').scrollTop();
      const sh = $('.side-chat .list')[0].scrollHeight;
      const mh = $('.side-chat .list .item').last().height();
      if ((($('.side-chat .list').height() + 20 + mh) >= (sh - st)) || !$scope.joined) {
        $('.side-chat .list').scrollTop(sh);
        $scope.showNotice = false;
        $scope.joined = true;
      } else {
        $scope.showNotice = true;
      }
    });

    return $scope.$on('$destroy', function () {
      $scope.socket.disconnect();
      return delete $scope.socket;
    });
  }

]);
