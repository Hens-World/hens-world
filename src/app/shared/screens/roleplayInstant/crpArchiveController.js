hensApp.controller('chatRpArchive', ['$scope', '$rootScope', '$routeParams', 'roleplayFactory',
function($scope, $rootScope, $routeParams, roleplayFactory){
  $scope.villages = ['sulimo','ulmo','wilwar','anar'];
  //TODO: kill this shit
  $scope.generals = ['sulimo-general', 'ulmo-general', 'wilwar-general', 'anar_general'];
  $scope.names = ['Sulimo Général', "Ulmo général", "Wilwar général", "Anar général"];
  $scope.base = myLocalized.medias;
  $scope.locations = [
    ['village','falaise','forêt','marais'],
    ['village','mer','lac','prairie'],
    ['village','champs','bois','rivière'],
    ['village','montagne','collines','souterrains'],
  ];
  $scope.$parent.info.isAppInit = false;
  $scope.init = ()=>
    roleplayFactory.get($routeParams.type, $routeParams.id).then(res=> {
      $scope.roleplay = res.data;
      for (let msg of Array.from($scope.roleplay.messages)) {
        msg.author = $scope.roleplay.userList[msg.user_id];
        if (msg.author && msg.author.char) {
          msg.author.chara = msg.author.char[1];
        }
      }
      return $scope.$parent.info.isAppInit = true;
    })
  ;

  return $scope.init();
}

]);