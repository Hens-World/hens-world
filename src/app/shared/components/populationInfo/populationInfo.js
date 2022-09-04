/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('populationInfo',['$compile',$compile=>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'popInfo.html',
    scope: {
      popNumber:"=",
      village:'='
    },
    controller($scope, $element){
      return $element.hover(
        e=> $element.parent().parent().find(`.village-${$scope.village}`).addClass('hovered')
        ,e=> $element.parent().parent().find(`.village-${$scope.village}`).removeClass('hovered'));
    }
  })

]);
