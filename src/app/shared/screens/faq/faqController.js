/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('faq', ['$scope',function($scope){
  $scope.$parent.info.isAppInit = true;
  return $('.question-container').click(
    function(e){
      return $(this).toggleClass('active');
  });
}

]);
