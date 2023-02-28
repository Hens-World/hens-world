hensApp.directive('selectMembers', ['$rootScope', 'userFactory', 'socket', ($rootScope, userFactory, socket) =>
({
  restrict: 'A',
  templateUrl: myLocalized.partials + 'selectMembers.html',
  scope: {
    members: '=',
    maxSize: '=',
    isOpen: '='
  },
  controller: ['$scope', '$element', function ($scope, $element) {
    $scope.searchlist = [];
    $scope.userSearch = "";

    $scope.addUser = function (user) {
      let exists = false;
      $scope.members.some(function (invitee) {
        if (invitee.ID === user.ID) {
          exists = true;
          return true;
        }
        return false;
      });
      if (!exists) {
        if (($scope.maxSize == null || !$scope.isOpen) || (($scope.members.length + 1) < $scope.maxSize)) {
          $scope.members.push(user);
        } else {
          $rootScope.setAlert('error', 'invite_full');
        }
      }
      $scope.userSearch = "";
      return $scope.searchList = [];
    };

    $scope.removeInvitee = invitee =>
      $scope.members.some(function (user, index) {
        if (user.ID === invitee.ID) {
          $scope.members.splice(index, 1);
          return true;
        } else {
          return false;
        }
      });

    $scope.searchForUsername = function () {
      const usearch = $scope.userSearch.toLowerCase();
      console.log("search username")
      if (usearch.length > 2) {
        let opts = {
          search: usearch
        };
        userFactory.getUserList(opts).catch($rootScope.handleError).then(function (res) {
          $scope.userList = res.data;
          $scope.searchList = [];
          for (let user of Array.from($scope.userList)) {
            let f = usearch.toLowerCase();
            let fail = false;
            let tan = user.display_name.toLowerCase(); // temporary author name
            for (var letter of Array.from(f)) {
              letter = letter.toLowerCase();
              if (tan.indexOf(letter) === -1) {
                fail = true;
              }
              tan = tan.slice(0, tan.indexOf(letter)) + tan.slice(tan.indexOf(letter) + 1, tan.length);
            }
            if (!fail) {
              user.selecName = [];
              f = usearch.toLowerCase();
              for (letter of Array.from(user.display_name)) {
                letter = letter.toLowerCase();
                if (f.indexOf(letter) > -1) {
                  user.selecName.push({
                    letter,
                    selected: true
                  });
                  f = f.slice(0, f.indexOf(letter)) + f.slice(f.indexOf(letter) + 1, f.length);
                } else {
                  user.selecName.push({
                    letter,
                    selected: false
                  });
                }
              }
              $scope.searchList.push(user)
            }
          }
        });
      } else {
        $scope.searchList = [];
      }


      // old implem
      //$scope.searchList = [];
      //if (usearch.length > 0) {
      //  for (let key in $scope.userList) {
      //    var index, letter;
      //    const user = $scope.userList[key];
      //    let fail = false; // fails if one of typed letters is not in username
      //    for (let invitee of Array.from($scope.members)) {
      //      if (invitee.ID === user.ID) {
      //        fail = true;
      //        break;
      //      }
      //    }
      //    let username = user.display_name.toLowerCase();
      //    let lastId = -1;
      //    for (index = 0; index < usearch.length; index++) {
      //      letter = usearch[index];
      //      if ((lastId === username.indexOf(letter)) || (username.indexOf(letter) === -1) || (lastId > username.indexOf(letter))) {
      //        fail = true;
      //      } else {
      //        lastId = username.indexOf(letter);
      //        username = username.replace(letter, '*');
      //      }
      //    }
      //    if (!fail) {
      //      $scope.searchList.push(user);
      //      const suser = $scope.searchList[$scope.searchList.length - 1];
      //      suser.selecName = [];
      //      suser.distance = 0;
      //      let lastSelection = 0;
      //      for (index = 0; index < suser.display_name.length; index++) {
      //        var selected;
      //        letter = suser.display_name[index];
      //        letter = letter.toLowerCase();
      //        if (usearch.indexOf(letter) === -1) {
      //          selected = false;
      //        } else {
      //          selected = true;
      //          if (lastSelection > 0) {
      //            suser.distance += index - lastSelection - 1;
      //          }
      //          lastSelection = index;
      //        }

      //        suser.selecName.push({
      //          letter,
      //          selected
      //        });
      //      }
      //    }
      //  }
      //  console.log($scope.searchList, 'searchlist');
      //  $scope.searchList.sort(function (a, b) {
      //    if (a.distance < b.distance) {
      //      return -1;
      //    } else if (a.distance > b.distance) {
      //      return 1;
      //    } else {
      //      return 0;
      //    }
      //  });
      //  return $scope.searchList.splice(3, $scope.searchList.length - 1);
      //}
    };

    $scope.$watch('userSearch', function (n, o) {
      if (n !== o) {
        hensApp.debounce($scope.searchForUsername, 250)();
      }
    });
  }]
})
]);
