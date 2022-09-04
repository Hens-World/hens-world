/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('longTitle', [()=>
  ({
    restrict: 'A',
    transclude: true,
    template: '<ng-transclude> </ng-transclude>',
    link($scope, $element){
      $element.children().first().hover(
        function(e){
          const totalW = $(this).width();
          const blockW = $element.width();
          $(this).stop();
          return $(this).animate({
            marginLeft: Math.min(0,- (totalW - blockW))
          },800,'linear');
        }

      ,function(e){
        $(this).stop();
        return $(this).animate({
          marginLeft: 0
        },400,'linear');
      });
    }
  })

]);