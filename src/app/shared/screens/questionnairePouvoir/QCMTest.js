/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('QCMTest', ['$scope','localeFactory', function($scope, localeFactory){
  hensApp.log('bienvenue sur le qcm test');
  $scope.$parent.info.isAppInit= true;
  $scope.ratio = { 
    neg:[30,31,25,38,31],
    pos:[23,33,28,30,38]
  };
  
  // fonction pour récupérer les extrêmes possible pour le caractère en cours, pour un pouvoir
  $scope.getMinMax=function(index,pouvoir,value){
    let max, min;
    if (value === "--") {
      max = $scope.ratio.neg[index] * -0.25;
      min = $scope.ratio.neg[index] * -1;
    }
    if (value === "-") {
      max = $scope.ratio.neg[index] * -0;
      min = $scope.ratio.neg[index] * -0.4;
    }
    if (value === "=") {
      min = $scope.ratio.neg[index] * -0.15;
      max = $scope.ratio.pos[index] * 0.15;
    }
    if (value === "+") {
      min = $scope.ratio.pos[index] * 0;
      max = $scope.ratio.pos[index] * 0.4;
    }
    if (value === "++") {
      min = $scope.ratio.pos[index] * 0.25;
      max = $scope.ratio.pos[index] *1;
    }
    if (value ==="") {
      min = $scope.ratio.neg[index] * -1.5;
      max = $scope.ratio.pos[index] * 1.5;
    }
    return [min,max];
  };




  $scope.processResult=function(){
    $scope.jsonResult = JSON.parse($scope.inputResult);
    $scope.outputResult= [];
    const url =`qcm/pouvoirs/${$scope.village}`;
    return localeFactory.JSON(url).then(function(res){
      res = res.data;
      for (let result of Array.from($scope.jsonResult)) {
        var index, pv, value;
        var i;
        let already = false;
        $scope.resultData = result.pv;
        $scope.displayResult = true;
        $scope.formatResult = [];
        for (index = 0; index < $scope.resultData.length; index++) {
          const data = $scope.resultData[index];
          $scope.formatResult.push({});
          const iterable = ["--","-","=","+","++"];
          for (let index2 = 0; index2 < iterable.length; index2++) {
            value = iterable[index2];
            const ratio = $scope.getMinMax(index,'',value);
            if ((data >= ratio[0]) && (data <= ratio[1])) {
              $scope.formatResult[index][`result${index2}`] = value; 
            }
          }
        }
        $scope.pvList = res;
        for (i = 0, index = i; i < $scope.pvList.pouvoirs.length; i++, index = i) {
          const pouvoir = $scope.pvList.pouvoirs[index];
          pouvoir.index = index;
          pouvoir.strict = 0;
          pouvoir.count = 0;
          for (index = 0; index < pouvoir.value.length; index++) {
            value = pouvoir.value[index];
            const couple = $scope.getMinMax(index,pouvoir,value);
            if (($scope.resultData[index] >= couple[0]) && ($scope.resultData[index] <= couple[1])) {
              pouvoir.count++;
            }
            if (value === "") {
              pouvoir.strict++;
            }
          }
        }
        $scope.storeCorrespondance();
        $scope.currentPouvoir = $scope.determinePower();
        if ($scope.currentPouvoir !== undefined) {
          for (pv of Array.from($scope.outputResult)) {
            if (pv.slug === $scope.currentPouvoir.slug) {
              pv.count++;
              already = true;
            }
          }
          if (!already || ($scope.outputResult.length === 0)) {
            $scope.outputResult.push({slug:$scope.currentPouvoir.slug,count:1});
          }
        } else {
          for (pv of Array.from($scope.outputResult)) {
            if (pv.slug === "nopouvoir!") {
              pv.count++;
              already = true;
            }
          }
          if (!already) {          
            $scope.outputResult.push({slug:"nopouvoir!",count:1});
          }
        }
      }
        
      return hensApp.log($scope.outputResult);
    });
  };

  // place chaque pouvoir dans un tableau correspondant à sa pertinence
  $scope.storeCorrespondance=function(){
    $scope.group = { 
      "count5": [],
      "count4": [],
      "count3": [], 
      "count2": [],
      "count1": []
    };
    for (let pouvoir of Array.from($scope.pvList.pouvoirs)) {
      if (pouvoir.count > 0) {
        if (pouvoir.strict > 410) {
          if (pouvoir.count === 5) { 
            $scope.group[`count${pouvoir.count}`].push(pouvoir);
          }
          else {}
        } else {
          $scope.group[`count${pouvoir.count}`].push(pouvoir);
        }
      }
    }
    hensApp.log($scope.formatResult);
    return hensApp.log($scope.group);
  };

  // renvoi un des pouvois au hasard parmi la catégorie de pertinence la plus élevée
  return $scope.determinePower=function(){
    for (let key in $scope.group) {
      const value = $scope.group[key];
      if (value.length >0) {
        if (value.length > 1) {
          const dice = (Math.floor(Math.random() * value.length));
          return value[dice];
        } else {
          return value[0];
        }
      }
    }
  };
}



]);