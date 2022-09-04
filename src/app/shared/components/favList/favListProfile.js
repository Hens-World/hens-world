/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('favList', [()=>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'favListProfile.html',
    scope: {
      likedArts:'=',
      toShow:'=',
      hoverArt:'='
    },
    controller($scope,$element){

      $scope.displayName=function(article){
        $scope.toShow= true;
        $scope.hoverArt = article;
        $scope.hoverArt.tabDate = $scope.hoverArt.date.split('T')[0].split('-');
        $scope.hoverArt.year = $scope.hoverArt.tabDate[0];
        $scope.hoverArt.month = $scope.hoverArt.tabDate[1];
        $scope.hoverArt.monthLabel = hensApp.c.months[parseInt($scope.hoverArt.month) - 1];
        $scope.hoverArt.day = $scope.hoverArt.tabDate[2];
        return $scope.hoverArt.formDate = `Le ${$scope.hoverArt.day} ${$scope.hoverArt.monthLabel} ${$scope.hoverArt.year}`;
      };

      return $scope.hideName = ()=> $scope.toShow = false;
    }
  })

]);
