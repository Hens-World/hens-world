/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('WhisperCreate', ['$scope', 'whisperFactory', '$rootScope', '$routeParams', 'userFactory',
  '$location', function ($scope, whisperFactory, $rootScope, $routeParams, userFactory, $location) {
    $scope.$parent.info.isAppInit = true;
    console.log('init whisper create');
    $scope.selectedUser = null;
    $scope.newSubject = {
      title: '',
      target: null,
      message: null
    };

    $scope.createSubject = function () {
      if (!$scope.newSubject.target) {
        return $rootScope.setAlert('error', 'Il faut un destinataire pour créer une nouvelle conversation!');
      } else if ($scope.newSubject.title.length < 3) {
        return $rootScope.setAlert('error', 'message_short');
      } else {
        return whisperFactory.create($scope.newSubject).then(function (res) {
          res = res.data;
          if (res.error) {
            return $rootScope.setAlert('error', res.msg);
          } else {
            $rootScope.setAlert('success', 'Conversation créée!');
            return $location.path(`/messagerie/${res.id}`);
          }
        });
      }
    };

    $scope.$watch('userSearchQuery', function (n, o) {
      if (n && (n.length >= 3)) {
        if ($scope.newSubject.target && (n !== $scope.newSubject.target.display_name)) {
          $scope.newSubject.target = null;
        }
        userFactory.search({str: n}).then(function (users) {
          $scope.searchUsers = users.data;
          if ($location.search().target === $scope.userSearchQuery) {
            const user = $scope.searchUsers.find(user => {
              return user.display_name === $location.search().target;
            });
            return $scope.setTarget(user);
          }
        });
      }
    });
    if ($location.search().target) {
      $scope.userSearchQuery = $location.search().target;
    }

    return $scope.setTarget = function (user) {
      $scope.newSubject.target = user;
      return $scope.userSearchQuery = user.display_name;
    };
  }]);