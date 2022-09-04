/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('Profil', [
  '$scope', 'userFactory', '$routeParams', 'postFactory', 'localeFactory', 'socket', '$rootScope', '$location',
  function ($scope, userFactory, $routeParams, postFactory, localeFactory, socket, $rootScope, $location) {
    $scope.shared = new ProfileShared($scope, $rootScope, $routeParams, $location, userFactory);

    //   .M"""bgd           mm
    //  ,MI    "Y           MM
    //  `MMb.      .gP"Ya mmMMmm `7MM  `7MM `7MMpdMAo.
    //    `YMMNq. ,M'   Yb  MM     MM    MM   MM   `Wb
    //  .     `MM 8M""""""  MM     MM    MM   MM    M8
    //  Mb     dM YM.    ,  MM     MM    MM   MM   ,AP
    //  P"Ybmmd"   `Mbmmd'  `Mbmo  `Mbod"YML. MMbmmd'
    //                                        MM
    //                                      .JMML.
    $scope.$parent.info.isAppInit = false;
    $scope.isMe = false;
    $scope.editShow = false; // edit overlay
    $scope.showProfil = true; // display the account page first

    //                 ,,                     ,,
    //  `7MM"""Yb.     db                   `7MM
    //    MM    `Yb.                          MM
    //    MM     `Mb `7MM  ,pP"Ybd `7MMpdMAo. MM   ,6"Yb.`7M'   `MF'
    //    MM      MM   MM  8I   `"   MM   `Wb MM  8)   MM  VA   ,V
    //    MM     ,MP   MM  `YMMMa.   MM    M8 MM   ,pm9MM   VA ,V
    //    MM    ,dP'   MM  L.   I8   MM   ,AP MM  8M   MM    VVV
    //  .JMMmmmdP'   .JMML.M9mmmP'   MMbmmd'.JMML.`Moo9^Yo.  ,V
    //                               MM                     ,V
    //                             .JMML.                OOb"

    $scope.initProfile = function (data) {
      $scope.shared.initProfile(data);
    };


    //                      ,,
    //  `7MMF'              db   mm
    //    MM                     MM
    //    MM  `7MMpMMMb.  `7MM mmMMmm
    //    MM    MM    MM    MM   MM
    //    MM    MM    MM    MM   MM
    //    MM    MM    MM    MM   MM
    //  .JMML..JMML  JMML..JMML. `Mbmo

    userFactory.getUserById(parseInt($routeParams.id)).then($scope.initProfile);
  }
]);
