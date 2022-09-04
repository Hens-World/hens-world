class ProfileCompteShared {
  constructor($scope, userFactory) {
    $scope.resetCompte = function () {
      socket.emit('resetCompte', $scope.user.ID);
      socket.on('compte:reset', res => window.location.reload());
    };

    $scope.displayMember = function (res) {
      $scope.user = res;
      $scope.user.onlineStatus = "Non défini";
      $scope.getRank();
    };

    $scope.toggleEdit = ()=>{
      $scope.$broadcast('toggleProfileEdit');
    };

    $scope.getRank = function () {
      userFactory.getUserRank($scope.user.ID).then(res => {
        $scope.user.selectedRank = res.data;
      });
      userFactory.getUserRankList($scope.user.ID).then(res => {
        $scope.user.ranks = res.data;
      });
    };

    $scope.selectRank = rank => userFactory.selectRank(rank.rank_id).then(function (res) {
      $scope.user.selectedRank = res.data.rank;
      $scope.selectingRank = false;
    });

    $scope.showRankSelection = () => {
      $scope.selectingRank = !$scope.selectingRank;
    }

    if ($scope.user) {
      $scope.displayMember($scope.user);
    } else {
      $scope.$watch('user', function (n, o) {
        if (n && n !== o) {
          $scope.displayMember($scope.user);
        }
      });
    }
  }
}