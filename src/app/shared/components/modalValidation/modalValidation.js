
hensApp.directive('modalValidation', ['$rootScope', $rootScope=>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'modalValidation.html',
    scope: {},
    controller($scope, $element){
      $scope.m = { //modal
        title: '',
        text: '',
        validation(){ return console.log('click'); },
        visible: false
      };

      $rootScope.$on('modal:set', function(scope, data){
        $scope.m = data;
        return $scope.m.visible = true;
      });

      $scope.hide = ()=> $scope.m.visible = false;

      return $scope.validate = function(){
        $scope.m.validation();
        return $scope.m.visible = false;
      };
    }
  })

]);
