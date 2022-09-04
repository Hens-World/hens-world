hensApp.controller('Population', [
  "$compile", "$scope", "userFactory", "$filter", "$rootScope",
  function ($compile, $scope, userFactory, $filter, $rootScope) {
    $scope.mainContribs = [1, 2, 38, 8, 10, 3, 4, 36, 12, 7, 5, 6, 9];
    $scope.searchingTeam = false;
    $scope.resetFilterIndiv = () => $scope.filterIndiv = {
      village: "",
      role: "",
      ID: "",
      display_name: "",
      store: {
        village: "",
        role: "",
        display_name: ""
      }
    };

    $scope.$on('onRepeatLast', ()=>{
      let page = document.querySelector('.page-container');
      if (page.offsetHeight >= page.scrollHeight && !$scope.searchingTeam && $scope.filterIndiv.display_name.length < 3) {
        $scope.nextPage();
      }
    });

    $scope.resetFilterIndiv();
    $scope.toggleSearchTeam = function () {
      $scope.searchingTeam = !$scope.searchingTeam;
      $scope.resetFilterIndiv();
      $scope.resetUserList();
    };

    $scope.setSearchVillage = function (village) {
      $scope.filterIndiv.ID = "";
      if ($scope.filterIndiv.village === village) {
        $scope.filterIndiv.village = "";
      }
      else {
        $scope.filterIndiv.village = village;
      }
      $scope.resetUserList();
    };

    $scope.setSearchType = function (type) {
      $scope.filterIndiv.ID = "";
      if ($scope.filterIndiv.role === type) {
        $scope.filterIndiv.role = "";
      }
      else {
        $scope.filterIndiv.role = type;
      }
      $scope.resetUserList();
    };

    $scope.$parent.info.isAppInit = false;

    $scope.userManager = userFactory;

    $scope.resetUserList = function () {
      $scope.$broadcast('lazy-load', 'reset');
      $scope.page = 1;
      $scope.userManager.getUserList({
        page: $scope.page, //    role: 'contributeur'
        role: $scope.filterIndiv.role,
        team: $scope.searchingTeam,
        village: $scope.filterIndiv.village,
        search: $scope.filterIndiv.display_name.length >= 3 ? $scope.filterIndiv.display_name : null
      }).then(function (res) {
        const userList = [];
        console.log(res.data);
        for (let user of Array.from(res.data)) {
          if (!user.avatar) {
            user.avatar = myLocalized.medias + 'profil/no-avatar.png';
          }
          if (user.role) {
            userList.push(user);
          } else {
            hensApp.log('removed');
          }
        }
        $scope.$parent.info.isAppInit = true;
        return $scope.fullList = ($scope.currentList = userList);
      });
    };

    $scope.resetUserList();

    $scope.$watch('filterIndiv.display_name', function (n, o) {
      if ((n !== o) && ((n.length >= 3) || ((n.length < 3) && (o.length = 3)))) {
        return $scope.resetUserList();
      }
    });

    $scope.nextPage = function (cb) {
      if (!$scope.searchingPage) {
        $scope.page++;
        $scope.searchingPage = true;
        $scope.userManager.getUserList({
          page: $scope.page,
          role: $scope.filterIndiv.role,
          team: $scope.searchingTeam,
          village: $scope.filterIndiv.village,
          search: $scope.filterIndiv.display_name.length >= 3 ? $scope.filterIndiv.display_name : null
        }).then(function (res) {
          const userList = [];
          for (let user of Array.from(res.data)) {
            if (!user.avatar) {
              user.avatar = myLocalized.medias + 'profil/no-avatar.png';
            }
            if (user.role) {
              userList.push(user);
            } else {
              hensApp.log('removed');
            }
          }
          $scope.fullList = ($scope.currentList = $scope.currentList.concat(userList));
          if (cb) cb(userList.length);
          $scope.searchingPage = false;
        });
      }
    };

    //bindings
    return $scope.nextPage = $scope.nextPage.bind(this);
  }
]);
