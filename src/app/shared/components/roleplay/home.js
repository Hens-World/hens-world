/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('crpHome', [() =>
({
  restrict: 'A',
  templateUrl: myLocalized.partials + 'crpHome.html',
  scope: {
    socket: '='
  },
  controller($scope, $element) {
    $scope.villages = hensApp.villages;
    $scope.base = myLocalized.medias;
    $scope.openCharte = () => $scope.showCharte = true;
    $scope.closeCharte = () => $scope.showCharte = false;
    return $scope.joinVillage = villageId => $scope.socket.emit('joinVillage', villageId);
  }
})

]);
