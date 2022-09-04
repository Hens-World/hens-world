/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('questionUnit', [()=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials + 'questionUnit.html',
    scope: {
      currentQuestion:'=',
      content:'=',
      callback:'=',
      result:'=',
      village:'='
    },
    controller($scope,$element){
      return $scope.setResult = function(questionId, choiceId) {
        $scope.result =[questionId,choiceId];
        for (let key in $scope.currentQuestion.choices) {
          const value = $scope.currentQuestion.choices[key];
          value.select = false;
        }
        return $scope.currentQuestion.choices[choiceId].select = true;
      };
    }
  })

]);