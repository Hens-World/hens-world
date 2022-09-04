/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
  Component for recent annonces preview,
  see annoncesController for full functionalities
*/
hensApp.directive('annonces', ["annoncesFactory", "$rootScope",
  (annoncesFactory, $rootScope)=>
    ({
      restrict: "A",
      templateUrl: myLocalized.partials + "annonces.html",
      scope: {
        content: '=',
        type: '=',
        options: '=',
        ready: '='
      },
      controller : ["$scope", "$element", function($scope, $element){
        annoncesFactory.get($scope.options).then(function(data){
          $scope.annonceList = data.data;
          for (let annonce of Array.from($scope.annonceList)) {
            if (+new Date(annonce.start_time) > 0) {
              annonce.hasDate = true;
              annonce.formatDate = moment(annonce.start_time).format('MM/YY');
            } else { annonce.hasDate = false; }
          }
          $scope.ready = true;
        });
      }
      ]
    })
  
]);
