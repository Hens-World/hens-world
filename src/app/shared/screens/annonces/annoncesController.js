/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('annonces', ['$scope', '$rootScope', 'annoncesFactory', function($scope, $rootScope, annoncesFactory){
  $scope.$parent.info.isAppInit= false;
  $scope.annoncesManager = annoncesFactory;
  $scope.init = function(){
    $scope.annoncesManager.get().then(data=> $scope.annonceList = data.data);
    return $scope.$parent.info.isAppInit = true;
  };
  if ($rootScope.isInitialized) {
    return $scope.init();
  } else {
    return $rootScope.$watch('isInitialized', function(n, o){
      console.log('passing through annonce init');
      if (n && (n !== o)) {
        return $scope.init();
      }
    });
  }
}

]);
