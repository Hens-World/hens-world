angular.module('app').controller('ChatController', ['$rootScope', '$scope', function ($rootScope, $scope) {
  $rootScope.$emit('bottomNav:select', "Tchat");
  $scope.$parent.info.isAppInit = true;
}]);