/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('roleplayCreateType', ['$scope', '$rootScope', '$routeParams', '$location',
  function($scope, $rootScope, $routeParams, $location){
    $scope.query = "";
    if ($location.search().location) {
      $scope.query = `?location=${$location.search().location}`;
    }
    console.log('hello roleplayCreateType');
    return $scope.$parent.info.isAppInit = true;
  }
]);