/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive("noAccess", ['$rootScope',$rootScope=>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'noAccess.html',
    controller:["$scope", "$element", function($scope, $element){
      $scope.imgList = [myLocalized.medias + "no_access/no_acces_ali.png",
        myLocalized.medias + "no_access/no_acces_faine.png",
        myLocalized.medias + "no_access/no_acces_rubis.png"];
      $scope.seed = Math.floor(Math.random() * $scope.imgList.length);
      $scope.hideNoAccess = ()=> {
        return $rootScope.showNoAccess = false;
      };
      return $(".no_access_container").css("margin-top", ($(".loader").height() / 2) - ($(".no_access_container").height() / 1.5));
    }
    ]
  })

]);
