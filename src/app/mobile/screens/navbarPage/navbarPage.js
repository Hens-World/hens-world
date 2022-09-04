angular.module('app').controller('NavbarPage', ['$scope', '$rootScope', function($scope, $rootScope){
  $rootScope.$emit('bottomNav:select', "Navbar");

  $scope.$parent.info.isAppInit = false;
  $scope.$parent.info.isAppInit = true;

}]);