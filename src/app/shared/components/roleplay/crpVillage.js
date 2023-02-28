/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('crpVillage', ['$location', $location =>
({
  restrict: 'A',
  templateUrl: myLocalized.partials + 'crpVillage.html',
  scope: {
    socket: '=',
    data: '='
  },
  controller($scope, $element) {
    $scope.base = myLocalized.medias;
    $scope.$parent.info.isAppInit = true;
    $scope.roomLoca = -1;
    $scope.inviteList = [];
    $scope.roomName = '';
    $scope.roomOpen = true;
    $scope.roomSpace = {
      value: 6,
      options: {
        floor: 2,
        ceil: 20
      }
    };
    $scope.roomTime = {
      value: 3,
      options: {
        floor: 0.5,
        ceil: 10,
        step: 0.5,
        precision: 2
      }
    };
    $scope.content = {
      status: {
        open: 'ouverte',
        private: 'privée'
      }
    };

    $scope.displayRoomCreation = () =>
      (() => {
        const result = [];
        for (let room of Array.from($scope.data.rooms)) {
          const diff = Math.floor(room.sinceCreation / 60);
          if (diff < 1) {
            result.push(room.creationString = 'moins d\'une minute');
          } else if (diff < 2) {
            result.push(room.creationString = ' une minute');
          } else if (diff < 60) {
            result.push(room.creationString = `${diff} minutes`);
          } else if (diff >= 60) {
            result.push(room.creationString = `${Math.ceil(diff / 60)} heures`);
          } else {
            result.push(undefined);
          }
        }
        return result;
      })()
      ;

    $scope.displayRoomCreation();
    $scope.socket.emit('getUserList');
    $scope.socket.on('userList', function (list) {
      $scope.userList = list;
      return $scope.$parent.info.isAppInit = true;
    });

    $scope.socket.on('villageRooms:update', function (list) {
      $scope.data.rooms = list;
      return $scope.displayRoomCreation();
    });
    $scope.villages = hensApp.villages;
    $scope.locationList = $scope.data.locations;

    $scope.setRoomLoca = index => $scope.roomLoca = index;

    $scope.backToHome = () => $scope.socket.emit('leaveVillage');

    $scope.switchRoomStatus = () => $scope.roomOpen = !$scope.roomOpen;



    $scope.createRoom = function () {
      if ($scope.roomName.length > 3) {
        const villageId = $scope.villages.indexOf($scope.data.village);
        return $scope.socket.emit('createRoom', {
          locationId: $scope.roomLoca,
          villageId,
          roomName: $scope.roomName,
          invitees: $scope.inviteList,
          duration: $scope.roomTime.value,
          maxSize: $scope.roomSpace.value,
          roomOpen: $scope.roomOpen
        }
        );
      } else {
        return alert('Nom trop court!');
      }
    };

    $scope.joinRoom = room => $scope.socket.emit('joinRolePlay', room.roomId);

    $scope.$on('$destroy', () => $element.find('.crp-village-container').getNiceScroll().remove());

    if ($location.search().location) {
      return $scope.setRoomLoca(0);
    }
  }
})

]);
