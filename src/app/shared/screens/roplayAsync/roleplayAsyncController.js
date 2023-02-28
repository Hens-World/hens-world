hensApp.controller('roleplayAsyncHome', ['$scope', 'roleplayFactory', 'localeFactory', 'postFactory', '$location',
  '$rootScope', function ($scope, roleplayFactory, localeFactory, postFactory, $location, $rootScope) {
    $scope.asyncHome = 'test';
    $scope.annoncesReady = false;
    $scope.annoncesOpt = {
      type: 'async',
      order: 'down'
    };
    $scope.roomSpace = {
      options: {
        floor: 2,
        ceil: 20
      }
    };

    $scope.newRoom = {
      isOpen: true,
      title: "",
      location: null,
      linkedPosts: [],
      inviteList: [],
      maxSize: 4
    };

    $scope.$parent.info.isAppInit = false;
    localeFactory.JSON("guideInfo").then(function (locations) {
      $scope.locations = locations.data.list;
      if ($location.search().location) {
        const foundLoca = $scope.locations.find(loca => loca.slug === $location.search().location);
        $scope.locaSearchQuery = foundLoca.nom;
        return $scope.newRoom.location = foundLoca;
      }
      if ($location.search().edit) {
        roleplayFactory.get('differe', parseInt($location.search().edit)).then(function (res) {
          if (!res.data.error) {
            $scope.$parent.info.isAppInit = true;
            $scope.existingRoom = res.data;
            return $scope.formatExistingRoom();
          } else {
            return $rootScope.setAlert('error', res.data.msg);
          }
        });
      } else {
        $scope.$parent.info.isAppInit = true;
      }
    });

    $scope.formatExistingRoom = function () {
      $scope.newRoom.title = $scope.existingRoom.title;
      $scope.newRoom.isOpen = !$scope.existingRoom.is_private;
      $scope.newRoom.maxSize = $scope.existingRoom.size;
      $scope.newRoom.description = $scope.existingRoom.description;
      $scope.roomSpace.floor = $scope.existingRoom.size;
      $scope.newRoom.linkedPosts = $scope.existingRoom.creations || [];
      $scope.newRoom.inviteList =
        $scope.existingRoom.members.filter(member => member.user_id !==
          $rootScope.currentUser.ID).map(member => $scope.existingRoom.userList[member.user_id]);
      $scope.newRoom.location = $scope.locations.find(location => location.id === $scope.existingRoom.location);
      return $scope.locaSearchQuery = $scope.newRoom.location.nom;
    };

    $scope.updateMyRoleplays = data => {
      $scope.myRoleplays = data.filter(roleplay => !roleplay.is_finished);
      $scope.myRoleplays.forEach(roleplay => roleplay.formatDate =
        moment(roleplay.creationtime).format(hensApp.DATE_FORMATS.SHORT));
      return $scope.$parent.info.isAppInit = true;
    };

    roleplayFactory.getMyRoleplays().then(res => $scope.updateMyRoleplays(res.data));

    $scope.toggleRoomStatus = () => {
      return $scope.newRoom.isOpen = !$scope.newRoom.isOpen;
    };

    $scope.addCreation = function (creation) {
      const exists = $scope.newRoom.linkedPosts.find(crea => crea.id === creation.id);
      if (!exists) {
        $scope.newRoom.linkedPosts.push(creation);
      }
      return $scope.creaSearchQuery = "";
    };

    $scope.removeCreation = (creation, index) => $scope.newRoom.linkedPosts.splice(index, 1);

    $scope.createRoom = () => {
      if ($scope.existingRoom) {
        return roleplayFactory.edit($scope.newRoom, $scope.existingRoom.id).then(function (res) {
          if (!res.error) {
            $rootScope.setAlert('success', res.msg);
            return $location.path(`/roleplay/differe/${$scope.existingRoom.id}`);
          } else {
            return $rootScope.setAlert('error', res.msg);
          }
        });
      } else {
        if ($scope.newRoom.title.length < 3) {
          return $rootScope.setAlert('error', 'Titre trop court!');
        } else if (!$scope.newRoom.location) {
          return $rootScope.setAlert('error', 'Aucun lieu défini');
        } else {
          return roleplayFactory.create($scope.newRoom).then(function (res) {
            if (!res.data.error) {
              return $location.path(`/roleplay/differe/${res.data.room_id}`);
            } else {
              return $rootScope.setAlert('error', res.data.msg);
            }
          });
        }
      }
    };

    $scope.setLieu = function (location) {
      $scope.newRoom.location = location;
      $scope.locaSearchQuery = location.nom;
      return $scope.searchLocations = [];
    };

    //TODO: Make it an online search
    $scope.$watch('locaSearchQuery', function (n, o) {
      $scope.searchLocations = [];
      if (n && (n.length >= 3)) {
        const searchList = n.split(' ');
        $scope.searchLocations = $scope.locations.filter(function (location) {
          const isValidList = searchList.map(function (search) {
            let isOk = false;
            let score = searchInWord(search, location.nom);
            if ((score !== -1) && !isOk) {
              isOk = true;
              location.score = score;
            }
            score = searchInWord(search, location.village, 10);
            if ((score !== -1) && !isOk) {
              isOk = true;
              location.score = score;
            }
            score = searchInArray(search, location.categories, 100);
            if ((score !== -1) && !isOk) {
              isOk = true;
              location.score = score;
            }
            return isOk;
          });
          const isValid = isValidList.reduce((acc, bool) => bool && acc, true);
          return isValid;
        });

        $scope.searchLocations.sort(function (a, b) {
          if (a.score < b.score) {
            return -1;
          } else if (a.score > b.score) {
            return 1;
          } else {
            return 0;
          }
        });
        if ($scope.newRoom.location.nom !== $scope.locaSearchQuery) {
          $scope.newRoom.location = null;
        }
        return $('.page-container').scrollTop = $('.page-container').scrollHeight;
      }
    });

    return $scope.$watch('creaSearchQuery', function (n, o) {
      if (n && (n.length >= 3)) {
        return postFactory.search(n).then(posts => $scope.searchCreations = posts.data);
      } else {
        return $scope.searchCreations = [];
      }
    });
  }]);

var searchInWord = function (search, word, initialScore) {
  const searchList = search.split(' ');
  let score = initialScore || 1;
  searchList.forEach(function (search) {
    let s = 0;
    let lastIndex = 0;
    const split = search.split('').filter(letter => {
      const i = word.substr(lastIndex, word.length).toLowerCase().indexOf(letter.toLowerCase());
      if (i >= 0) {
        if (s === 0) {
          s += 1;
        } else {
          s += i;
        }
        lastIndex += i;
        return true;
      } else {
        return false;
      }
    });
    if ((search.length === split.length) && (score !== -1)) {
      return score += s;
    } else {
      return score = -1;
    }
  });
  return score;
};

var searchInArray = function (search, array) {
  let score = -1;
  array.forEach(function (word) {
    const s = searchInWord(search, word);
    if (s !== -1) {
      return score = s;
    }
  });
  return score;
};



