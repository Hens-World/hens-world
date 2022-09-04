/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('QCM', [
  '$scope', 'mediaFactory', 'localeFactory', '$routeParams', 'userFactory', '$rootScope',
  function ($scope, mediaFactory, localeFactory, $routeParams, userFactory, $rootScope) {
    $scope.displayResult = false;
    //portée maximale d'un caractère [à affiner]
    $scope.ratio = {
      neg: [30, 31, 25, 38, 31],
      pos: [26, 33, 28, 30, 37]
    };
    $scope.chosenPower = [];
    $scope.characterIndex = parseInt($routeParams.cid);
    //mise à jour de la question à afficher

    $(document).keydown(function (e) {
      if (e.keyCode === 13) {
        return $scope.validateQuestion();
      }
    });

    $scope.updateQuestion = function () {
      // if $scope.currentIndex < 10
      //   q = "Q0#{$scope.currentIndex}"
      // if $scope.currentIndex >= 10
      //   q = "Q#{$scope.currentIndex}"
      let q;
      if ($scope.order[$scope.currentIndex - 1] < 10) {
        q = `Q0${$scope.order[$scope.currentIndex - 1]}`;
      }
      if ($scope.order[$scope.currentIndex - 1] >= 10) {
        q = `Q${$scope.order[$scope.currentIndex - 1]}`;
      }
      // $scope.currentQuestion = $scope.qcmData.questions[q]
      // $scope.currentQuestion.image="url('" + myLocalized.medias + 'qcm/'+$scope.currentIndex+".png')"
      $scope.currentQuestion = $scope.qcmData.questions[q];
      $scope.currentQuestion.image = `url('${myLocalized.medias}qcm/${$scope.order[$scope.currentIndex - 1]}.png')`;
    };

    //récupérer les textes
    $scope.getContent = function () {
      const contentUrl = "qcm/qcmLabel";
      return localeFactory.JSON(contentUrl)
        .then(function (datas) {
          $scope.content = datas.data;
          return $scope.checkInit();
        });
    };

    $scope.checkInit = function () {
      if ($scope.info.user !== undefined) {
        if (($scope.info.user.pouvoir != null) && (hensApp.readCookie('QcmReset') != null) && $scope.characterIndex === 1) {
          return $scope.setBack();
        } else {
        }

      } else {
        setTimeout($scope.checkInit, 100);
      }
    };

    $scope.setBack = () => {
      $('.loader').html("<div style='font-size:16em; position:absolute;width:300px;left:50%;margin-left:-150px;top:150px;'> Vous avez déjà rempli le questionnaire de votre premier personnage. <a style='color:#D9B76F;' href='/'> Retour à l'accueil </a> </div>");
    }

    // mise en place graphique et ordonner les données
    $scope.displayQcm = function (datas) {
      $scope.qcmData = {
        questions: {},
        caracteres: datas.caracteres
      };
      for (let question of Array.from(datas.questions)) {
        const displayedQ = {
          id: question.id,
          choices: {}
        };
        for (let choice of Array.from(question.choices)) {
          displayedQ.choices[choice.id] = choice;
        }
        $scope.qcmData.questions[question.id] = displayedQ;
      }
      $scope.order = __range__(1, Object.keys($scope.qcmData.questions).length, true);
      let i = $scope.order.length;
      for (let order of Array.from($scope.order)) {
        const j = Math.floor(Math.random() * i);
        const x = $scope.order[--i];
        $scope.order[i] = $scope.order[j];
        $scope.order[j] = x;
      }
      $scope.updateQuestion();
      $scope.$parent.info.isAppInit = true;
    };

    //récupérer les json
    $scope.getQcmData = function () {
      userFactory.getCharacter($rootScope.currentUser.ID, $scope.characterIndex).then(data =>{
        const character = data.data;
        if (character && character.pouvoir_id != null && character.char_index === 1) {
          $scope.setBack();
        }
        else {
          if (character) {
            $scope.village = hensApp.villages[character.village];
            console.log($scope.village, hensApp.villages, character);
            const qcmDataUrl = "qcm/qcmCode";
            localeFactory.JSON(qcmDataUrl)
                .then(data => $scope.displayQcm(data.data));
          }
          else if ($scope.characterIndex === 1){
            $scope.village = $rootScope.currentUser.village;
            const qcmDataUrl = "qcm/qcmCode";
            localeFactory.JSON(qcmDataUrl)
                .then(data => $scope.displayQcm(data.data));
          }
          else {
            console.warn("Not having a village and trying to do QCM should not be possible !");
          }
        }
      }).catch($rootScope.handleError);
    };

    //passer à la question suivante
    $scope.validateQuestion = function () {
      if ($scope.currentIndex < Object.keys($scope.qcmData.questions).length) {
        $scope.currentIndex++;
        $scope.updateResult();
        $scope.updateQuestion();
      } else {
        $scope.updateResult();
        $scope.setFinalResult();
      }
    };

    //fonction pour déterminer le pouvoir final
    $scope.setFinalResult = function () {
      //setFinal result
      const form = [];
      for (let rIndex = 0; rIndex < $scope.resultData.length; rIndex++) {
        const carac = $scope.resultData[rIndex];
        const neg = carac.neg / $scope.ratio.neg[rIndex];
        const pos = carac.pos / $scope.ratio.pos[rIndex];
        const caracNumber = Math.round((-neg + pos) * 100);
        form.push(caracNumber);
      }
      $scope.resultDataFinal = form;
      let url = `qcm/pouvoirs/${$scope.village}`;
      localeFactory.JSON(url).then(function (res) {
        let data, index, pouvoir;
        res = res.data;
        $scope.displayResult = true;
        $scope.formatResult = [];
        $scope.max = [0, 0];
        for (index = 0; index < $scope.resultDataFinal.length; index++) {
          data = $scope.resultDataFinal[index];
          if (Math.abs(data) > Math.abs($scope.max[1])) {
            $scope.max = [index + 1, data];
          }
        }
        $scope.pvList = res.pouvoirs;
        for (index = 0; index < $scope.pvList.length; index++) {
          var chosenpow;
          pouvoir = $scope.pvList[index];
          if ((pouvoir.value[1] === "+") && ($scope.max[0] === pouvoir.value[0]) && ($scope.max[1] > 0)) {
            chosenpow = $scope.pvList[index];
            chosenpow.index = index;
            $scope.chosenPower.push(chosenpow);
          }
          if ((pouvoir.value[1] === "-") && ($scope.max[0] === pouvoir.value[0]) && ($scope.max[1] < 0)) {
            chosenpow = $scope.pvList[index];
            chosenpow.index = index;
            $scope.chosenPower.push(chosenpow);
          }
        }
        if ($scope.chosenPower.length === 0) {
          $scope.chosenPower = $scope.pvList.map((pv, index) => {
            pv.index = index;
            return pv;
          }); // IF TRUE NEUTRAL, CHOSE AMONG
        }
        $scope.random = Math.round(Math.random() * ($scope.chosenPower.length - 1));
        url = `qcm/description/${$scope.village}/${$scope.chosenPower[$scope.random].index + 1}`;
        localeFactory.JSON(url).then(function (res) {
          hensApp.createCookie('QcmReset', true, 30);
          $scope.power = res.data;
          $scope.imageLink =
            myLocalized.medias + `pouvoirs/${$scope.village}/${$scope.chosenPower[$scope.random].index + 1}.png`;
          $scope.content.title = `Le pouvoir qui vous détermine est: `;
          $scope.userManager = userFactory;
          //REPLACE HERE
          userFactory.setPower($rootScope.currentUser.ID, $scope.characterIndex, $scope.chosenPower[$scope.random].index + 1)
              .then((res)=>{
                $rootScope.setAlert("success", "Pouvoir obtenu !");
              }).catch($rootScope.handleError);
        });
      });
    };

    // ajouter les points de la question répondue au résultat final
    $scope.updateResult = function () {
      $scope.result = $scope.qcmData.questions[$scope.result[0]].choices[$scope.result[1]].value;
      for (let index = 0; index < $scope.result.length; index++) {
        const value = $scope.result[index];
        if (typeof value === "string") {
          if (($scope.resultData[index].pos / $scope.ratio.pos[index]) >
            ($scope.resultData[index].neg / $scope.ratio.neg[index])) {
            $scope.resultData[index].pos = Math.max(0, $scope.resultData[index].pos - parseInt(value));
          } else if (($scope.resultData[index].pos / $scope.ratio.pos[index]) <
            ($scope.resultData[index].neg / $scope.ratio.neg[index])) {
            $scope.resultData[index].neg = Math.max(0, $scope.resultData[index].neg - parseInt(value));
          }
        } else if (typeof value === "number") {
          if (value >= 0) {
            $scope.resultData[index].pos += value;
          }
          if (value < 0) {
            $scope.resultData[index].neg += -value;
          }
        }
      }
    };

    //init
    $scope.result = {};
    $scope.$parent.info.isAppInit = false;
    // $scope.$parent.info.isAppInit = true

    $scope.currentIndex = 1;
    $scope.resultData = [
      {
        neg: 0,
        pos: 0
      }, {
        neg: 0,
        pos: 0
      }, {
        neg: 0,
        pos: 0
      }, {
        neg: 0,
        pos: 0
      }, {
        neg: 0,
        pos: 0
      }
    ];

    $scope.getContent();
    if ($rootScope.currentUser) {
      $scope.getQcmData();

    }
    else {
      $rootScope.$watch('currentUser', (n, o)=>{
        if (n != null) {
          $scope.getQcmData();
        }
      });
    }
  }
]);

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}