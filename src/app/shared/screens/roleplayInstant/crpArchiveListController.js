/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('chatRpArchiveList', ['$scope', '$rootScope', '$compile', '$routeParams', 'roleplayFactory',
function($scope,$rootScope,$compile,$routeParams, roleplayFactory){
  $scope.$parent.info.isAppInit = false;
  $scope.base = myLocalized.medias;
  $scope.villages = ['sulimo','ulmo','wilwar','anar'];
  $scope.locations = [
    ['village','falaise','forêt','marais'],
    ['village','mer','lac','prairie'],
    ['village','champs','bois','rivière'],
    ['village','montagne','collines','souterrains'],
  ];
  $scope.getList =function(){
    $scope.archiveInit = true;
    return roleplayFactory.getAll({

    }).then(result=> {
      $scope.list = result.data;
      const userKey = {};
      // populate the rp with data
      for (var rp of Array.from($scope.list)) {
        console.log('showing rp', rp);
        if(rp.type === 'differe') {
          rp.location = 0;
        }
        for (let user of Array.from(rp.userList)) {
          userKey[`user#${user.ID}`] = user;
        }
      }
      $scope.$parent.info.isAppInit = true;
      if($routeParams.rid) {
        return (() => {
          const result1 = [];
          for (rp of Array.from(scope.list)) {
            if (rp.rid === parseInt($routeParams.rid)) {
              result1.push($scope.openRP(rp));
            } else {
              result1.push(undefined);
            }
          }
          return result1;
        })();
      }
    });
  };
  if ($rootScope.socketConnected && !$scope.archiveInit) {
    $scope.getList();
  } else {
    $rootScope.$watch('socketConnected', function(n,o){
      if((n !== o) && n && !$scope.archiveInit) {
        return $scope.getList();
      }
    });
  }

  $scope.openRP = rp=> $scope.srp = rp;
  return $scope.closeRP = ()=> $scope.srp = null;
}
]);
