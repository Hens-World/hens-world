hensApp.directive('selectMembers', ['$rootScope', 'userFactory', 'socket', ($rootScope, userFactory, socket)=>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'selectMembers.html',
    scope: {
      members: '=',
      maxSize: '=',
      isOpen: '='
    },
    controller: ['$scope', '$element', function($scope, $element){
      $scope.searchlist = [];
      $scope.getUsers = function(){
        socket.on('userList',list=> $scope.userList = list);
        return socket.emit('getUserList');
      };

      if ($rootScope.isInitialized && $rootScope.socketConnected) {
        $scope.getUsers();
      } else {
        $rootScope.$watch('socketConnected', function(n,o){
          if(n && (n !== o)) {
            return $scope.getUsers();
          }
        });
      }
      $scope.userSearch = "";

      $scope.addUser=function(user){
        let exists = false;
        $scope.members.some(function(invitee){
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

      $scope.removeInvitee=invitee=>
        $scope.members.some(function(user,index){
          if (user.ID === invitee.ID) {
            $scope.members.splice(index,1);
            return true;
          } else {
            return false;
          }
        })
      ;

      $scope.searchForUsername = function(){
        const usearch = $scope.userSearch.toLowerCase();
        $scope.searchList = [];
        if(usearch.length > 0) {
          for (let key in $scope.userList) {
            var index, letter;
            const user = $scope.userList[key];
            let fail = false; // fails if one of typed letters is not in username
            for (let invitee of Array.from($scope.members)) {
              if (invitee.ID === user.ID) {
                fail = true;
                break;
              }
            }
            let username = user.display_name.toLowerCase();
            let lastId = -1;
            for (index = 0; index < usearch.length; index++) {
              letter = usearch[index];
              if ((lastId === username.indexOf(letter)) || (username.indexOf(letter) === -1) || (lastId > username.indexOf(letter))) {
                fail = true;
              } else {
                lastId = username.indexOf(letter);
                username = username.replace(letter,'*');
              }
            }
            if (!fail) {
              $scope.searchList.push(user);
              const suser = $scope.searchList[$scope.searchList.length - 1];
              suser.selecName = [];
              suser.distance = 0;
              let lastSelection = 0;
              for (index = 0; index < suser.display_name.length; index++) {
                var selected;
                letter = suser.display_name[index];
                letter = letter.toLowerCase();
                if (usearch.indexOf(letter) === -1) {
                  selected = false;
                } else {
                  selected = true;
                  if(lastSelection > 0 ) {
                    suser.distance += index - lastSelection - 1;
                  }
                  lastSelection = index;
                }

                suser.selecName.push({
                  letter,
                  selected
                });
              }
            }
          }
          console.log($scope.searchList, 'searchlist');
          $scope.searchList.sort(function(a,b){
            if(a.distance < b.distance) {
              return -1;
            } else if (a.distance > b.distance) {
              return 1;
            } else {
              return 0;
            }
          });
          return $scope.searchList.splice(3,$scope.searchList.length - 1);
        }
      };
      return $scope.$watch('userSearch', function(n,o){
        if (n !== o) {
          return hensApp.debounce($scope.searchForUsername,250)();
        }
      });
    }

    ]
  })

]);
