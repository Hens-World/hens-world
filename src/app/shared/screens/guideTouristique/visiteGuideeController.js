hensApp.controller('visiteGuidee', [
  "$scope", "localeFactory", "$rootScope", function ($scope, localeFactory, $rootScope) {
    $scope.$parent.info.isAppInit = false;
    $scope.filterLieu = {
      nom: "",
      village: "",
      type: "",
      hasArt: false,
      unique: false
    };
    $scope.selecLieu = null;
    $scope.openLieu = lieu => {
      if (lieu === $scope.selecLieu) {
        $scope.selecLieu = null;
      }
      else {
        $scope.selecLieu = lieu;
      }
    }

    $scope.setSearchVillage = village => $scope.filterLieu.village = village;

    $scope.setSearchType = type => $scope.filterLieu.type = type;

    $scope.togglePostLoca = () => $scope.filterLieu.hasArt = !$scope.filterLieu.hasArt;

    $scope.toggleUniqueLoca = () => $scope.filterLieu.unique = !$scope.filterLieu.unique;

    $scope.init = function (info) {
      $scope.postSlugList = [];

      //TODO: locations with creation
      // if (parseInt(wpAPIData.user_id) !== 0) {
      //   for (let post of Array.from($rootScope.globalPostList)) {
      //     if ($scope.postSlugList.indexOf(post.lieu.slug) === -1) {
      //       $scope.postSlugList.push(post.lieu.slug);
      //     }
      //   }
      // }

      for (let lieu of Array.from(info.list)) {
        lieu.image = myLocalized.medias + (`guide-touristique/visite-guidee/${lieu.village}/${lieu.slug}.jpg`);
        lieu.hasArt = false;
        if (lieu.unique === undefined) {
          lieu.unique = false;
        }
        if ($rootScope.currentUser && ($scope.postSlugList.indexOf(lieu.slug) > -1)) {
          lieu.hasArt = true;
        }
      }
      info.list.sort(function (a, b) {
        let left, left1;
        return (left = a.nom < b.nom) != null ? left : -{1: (left1 = a.nom > b.nom) != null ? left1 : {1: 0}};
      });
      $scope.$parent.info.isAppInit = true;
      $scope.locaList = info.list;
    };

    //init
    $scope.waitForPost = function () {
      $scope.init($scope.tempRes);
    };

    console.log(' visit')
    localeFactory.JSON("guideInfo").then(function (res) {
      $scope.tempRes = res.data;
      $scope.waitForPost();
    });
  }
]);