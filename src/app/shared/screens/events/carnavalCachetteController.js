angular.module('app').controller('CarnavalCachette', [
  '$rootScope', '$scope', 'cachetteSocket', '$location', function ($rootScope, $scope, cachetteSocket, $location) {
    $scope.$parent.info.isAppInit = false;
    cachetteSocket.connect();
    $scope.updateTimeLeft = () => {
      let tl = moment.duration($scope.lobby.timeLeft - (+new Date() - $scope.lobby.timeLocal));
      if(tl.minutes() === 0 && tl.seconds() < 0){
        cachetteSocket.emit('lobby:load');
      }
      $scope.lobby.timeLeftFormat = tl.minutes() + 'min ' + tl.seconds() + 'sec';
    };
    cachetteSocket.on('lobby:update', (data) => {
      $scope.lobby = data;
      console.log('received lobby update');
      $scope.lobby.timeLocal = +new Date();
      if (!$scope.timeInterval) $scope.timeInterval = setInterval($scope.updateTimeLeft, 1000);
      $scope.updateTimeLeft();
    });

    cachetteSocket.on('lobby:fail', () => {
      $rootScope.setAlert('error', `Pas assez de participants!`);
    });

    cachetteSocket.on('game:join', (data) => {
      let s = data.village.split('-');
      if (s.length === 1) {
        $location.path(`/events/map/carnaval-cachette/${data.village}/village`).search('gameId', data.id);
      } else {
        //TODO: anar quartier
        $location.path(`/events/map/carnaval-cachette/${s[0]}/village`).search('gameId', data.id).search('quartier', s[1]);
      }
    });
    $scope.joinHunters = () => {
      cachetteSocket.emit('lobby:join', {team: 'hunters'});
    };

    $scope.joinProps = () => {
      cachetteSocket.emit('lobby:join', {team: 'props'});
    };
    $scope.$parent.info.isAppInit = true;
    cachetteSocket.emit('lobby:load');
    $scope.$on('$destroy', () => {
      cachetteSocket.emit('lobby:leave');
      cachetteSocket.removeAllListeners();
    });
  }
]);