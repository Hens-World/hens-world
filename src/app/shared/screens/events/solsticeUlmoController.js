angular.module('app').controller('SolsticeUlmo', [
  '$rootScope', '$scope', 'eventsFactory', 'aquariumSocket', '$location',
  function ($rootScope, $scope, eventsFactory, aquariumSocket, $location) {
    $scope.$parent.info.isAppInit = false;
    $scope.categories = [
      {
        icon: "icons/icon_fish.png",
        tag: "body"
      }, {
        icon: "icons/icon_color.png",
        tag: "color"
      }, {
        icon: "icons/icon_eye.png",
        tag: "eye"
      }, {
        icon: "icons/icon_hat.png",
        tag: "hat"
      }, {
        icon: "icons/icon_accessory.png",
        tag: "accessory"
      }, {
        icon: "icons/icon_accessory.png",
        tag: "jewel"
      },
    ];

    $scope.satisfactionData = [
      {
        tag: 'angry',
        label: 'Insatisfait'
      }, {
        tag: 'neuter',
        label: 'Neutre'
      }, {
        tag: 'mild',
        label: 'Satisfait'
      }, {
        tag: 'satisfied',
        label: 'Comblé'
      },
    ];

    $scope.currentTab = 'aquarium';
    $scope.tabs = [
      {
        text: 'Aquarium',
        tab: 'aquarium'
      }, {
        text: 'Registre',
        tab: 'registre'
      }, {
        text: 'Notice',
        tab: 'notice'
      },
    ];

    $scope.switchTab = (tab) => {
      $scope.currentTab = tab;

      setTimeout(() => {
        switch (tab) {
          case 'aquarium':
            break;
          case 'creation':
            $scope.updateNewPoisson();
            break;
        }
      });
    };

    $scope.newPoissonData = {
      body: null,
      hat: null,
      eye: null,
      jewel: null
    };

    $scope.newPoisson = {
      name: null,
      body_id: null,
      cap_id: null,
      eye_id: null,
      colors: null,
      jewel_id: null,
    };

    eventsFactory.getCurrentEvent().then(data => {
      if (!data.data || data.data.slug !== 'solstice-hiver') {
        $rootScope.setAlert('error', 'vous n\'avez pas accès à cela pour le moment.');
        return $location.path('/map');
      }
      Promise.all([
        eventsFactory.solsticeUlmo.getPoissons(), eventsFactory.solsticeUlmo.getData(),
        eventsFactory.solsticeUlmo.getMyStatus(), eventsFactory.solsticeUlmo.getLogs()
      ]).then((aggregatedData) => {
        let [poi, data, status, logs] = aggregatedData;
        $scope.$parent.info.isAppInit = true;
        $scope.data = data.data;
        $scope.logs = logs.data.map(log => {
          log.formattedDate = moment(log.created_at).format(hensApp.DATE_FORMATS.MIDDLE);
          return log;
        });
        for (let cat in $scope.data) {
          if (cat !== 'colors') {
            $scope.data[cat].map(skeleton => {
              skeleton.url = "/medias/events/solstice-hiver" + skeleton.url;
              if (cat === 'poissons') {
                skeleton.nageoire.url = "/medias/events/solstice-hiver" + skeleton.nageoire.url;
              }
              return skeleton;
            });
          }
        }
        $scope.poissonList = poi.data.map($scope.mapPoisson);
        $scope.satisfied = 0;
        $scope.poissonList.forEach(poisson => {
          if (poisson.satisfaction === 3) $scope.satisfied++;
        });
        $scope.setStatus(status.data);
        $scope.creationTab = "body";
        $scope.randomizePoisson();

        //once everything is up, start listening to changes
        if ($rootScope.socketConnected) {
          $scope.socketInit();
        } else {
          let w = $rootScope.$watch('socketConnected', (n, o) => {
            if (n && n !== o) {
              $scope.socketInit();
              w();
            }
          });
        }
      }).catch($rootScope.handleError);
    }).catch($rootScope.handleError);

    $scope.mapPoisson = poisson => {
      poisson.body = $scope.data.poissons.find(pBody => pBody.id === poisson.body_id);
      poisson.eye = $scope.data.yeux.find(eye => eye.id === poisson.eye_id);
      poisson.hat = $scope.data.chapeaux.find(hat => hat.id === poisson.cap_id);
      poisson.jewel = $scope.data.accessoires.find(jewel => jewel.id === poisson.jewel_id);
      poisson.accessory = $scope.data.accessoires.find(jewel => jewel.id === poisson.accessory_id);
      poisson.formattedCreation = moment(poisson.created_at).format(hensApp.DATE_FORMATS.MIDDLE);
      poisson.satisfactionData = $scope.satisfactionData[poisson.satisfaction];
      return poisson;
    };

    $scope.socketInit = () => {
      aquariumSocket.connect();
      aquariumSocket.on('poisson_kick', () => {
        $rootScope.setAlert('error', "L'évènement est terminé, vous n'avez plus accès à l'aquarium !");
        $location.path('/map');
      });
      aquariumSocket.on('poisson_update', (data) => {
        $scope.updatePoissonData(data);
        eventsFactory.solsticeUlmo.getLogs().then(data => {
          $scope.logs = data.data.map(log => {
            log.formattedDate = moment(log.created_at).format(hensApp.DATE_FORMATS.MIDDLE);
            return log;
          });
        });
        eventsFactory.solsticeUlmo.getMyStatus().then(data => {
          $scope.setStatus(data.data);
        });
      });
    };

    $scope.updatePoissonInterval = setInterval(() => {
      $scope.poissonList.forEach(poisson => {
        poisson.fedTime += 1000;
        poisson.favorTime += 1000;
        poisson.formattedFavorTime = hensApp.formatTime(poisson.favorTime, hensApp.customTimeFormats.MINUTE_SECOND_TEXT);
        poisson.formattedHungerTime = hensApp.formatTime(poisson.fedTime, hensApp.customTimeFormats.MINUTE_SECOND_TEXT);
      });
    }, 1000);


    $scope.$on('$destroy', () => {
      clearInterval($scope.updatePoissonInterval);
    });

    $scope.updatePoissonData = (newPoissons) => {
      newPoissons.forEach(newPoisson => {
        let poisson = $scope.poissonList.find(poisson => poisson.id === newPoisson.id);
        // add new poissons
        if (!poisson) {
          $scope.poissonList.push($scope.mapPoisson(newPoisson));
        }
        //update existing poissons
        else {
          poisson.hunger_updated_at = newPoisson.hunger_updated_at;
          poisson.satisfaction_updated_at = newPoisson.satisfaction_updated_at;
          poisson.fedTime = newPoisson.fedTime;
          poisson.favorTime = newPoisson.favorTime;
          poisson.satisfaction = newPoisson.satisfaction;
          poisson.satisfactionData = $scope.satisfactionData[poisson.satisfaction];
          poisson.wish = newPoisson.wish;
          poisson.hungry = newPoisson.hungry;
          $scope.updatePoisson(0.19, poisson, "#poisson-" + poisson.id);
        }
      });
      $scope.satisfied = 0;
      $scope.poissonList.forEach(poisson => {
        if (poisson.satisfaction === 3) $scope.satisfied++;
      });
      //remove old poisson not in list anymore
      $scope.poissonList =
        $scope.poissonList.filter(poisson => newPoissons.some(newPoisson => newPoisson.id === poisson.id));
    };

    $scope.interval = 0;
    $scope.setStatus = (status) => {
      status.timeBeforeNextFood =
        hensApp.formatTime(status.timeUntilNext, hensApp.customTimeFormats.MINUTE_SECOND_TEXT);
      if (status.wish) {
        status.wish.remainingTime = hensApp.formatTime(status.wishFor, hensApp.customTimeFormats.MINUTE_SECOND_TEXT);
      }
      $scope.myStatus = status;
      clearInterval($scope.interval);
      $scope.interval = setInterval(() => {
        $scope.myStatus.timeUntilNext -= 1000;
        if ($scope.myStatus.wish) {
          $scope.myStatus.wishFor -= 1000;
        }
        $scope.myStatus.timeBeforeNextFood =
          hensApp.formatTime(status.timeUntilNext, hensApp.customTimeFormats.MINUTE_SECOND_TEXT);
        if ($scope.myStatus.wish) {
          $scope.myStatus.wish.remainingTime =
            hensApp.formatTime(status.wishFor, hensApp.customTimeFormats.MINUTE_SECOND_TEXT);
        }
        if (($scope.myStatus.feedStock < 3 && $scope.myStatus.timeUntilNext <= 0) || ($scope.myStatus.wish && $scope.myStatus.wishFor <= 0 && $scope.myStatus.wishFor > -1000 * 10)) {
          eventsFactory.solsticeUlmo.getMyStatus().then(data => {
            $scope.setStatus(data.data);
          });
        }
      }, 1000);
    };

    $scope.selectCategory = (category) => {
      $scope.creationTab = category.tag;
    };

    $scope.openPopup = (type) => {
      $scope.popupType = type;
      $scope.showPopup = true;
    };

    $scope.closePopup = () => {
      $scope.popupType = null;
      $scope.showPopup = false;
    };

    $scope.selectPart = (tag, data) => {
      switch (tag) {
        case 'body':
          $scope.newPoisson.body_id = data.id;
          $scope.newPoissonData.body = data;
          break;
        case 'eye':
          $scope.newPoisson.eye_id = data.id;
          $scope.newPoissonData.eye = data;
          break;
        case 'hat':
          $scope.newPoisson.cap_id = data.id;
          $scope.newPoissonData.hat = data;
          break;
        case 'accessory':
          $scope.newPoisson.accessory_id = data.id;
          $scope.newPoissonData.accessory = data;
          break;
        case 'jewel':
          $scope.newPoisson.jewel_id = data.id;
          $scope.newPoissonData.jewel = data;
          break;
        case 'color':
          $scope.newPoisson.colors = data.join('/');
          break;
      }
      $scope.updateNewPoisson();
    };

    $scope.updatePoisson = (scale, data, selector) => {
      if (data.body && data.eye) {
        let poissonContainer = document.querySelector(selector);
        if (!poissonContainer) {
          setTimeout(() => {
            $scope.updatePoisson(scale, data, selector);
          });
          return;
        }
        let bodyElement = poissonContainer.querySelector('.poissonBody');
        let eyeElement = poissonContainer.querySelector('.poissonEye');
        let accessoryElement = poissonContainer.querySelector('.poissonAccessory');
        let jewelElement = poissonContainer.querySelector('.poissonJewel');
        let hatElement = poissonContainer.querySelector('.poissonHat');
        let nageoireElement = poissonContainer.querySelector('.poissonNageoire');
        poissonContainer.style.width = data.body.width * scale + 'px';
        poissonContainer.style.height = data.body.height * scale + 'px';
        bodyElement.style.width = data.body.width * scale + 'px';
        bodyElement.style.height = data.body.height * scale + 'px';
        let bodyPivot = {
          x: data.body.pivot.x * scale,
          y: data.body.pivot.y * scale,
        };

        //eye
        $scope.placePart(eyeElement, data.eye, bodyPivot, data.body.anchors[data.eye.anchor_type], scale, data);
        $scope.placePart(hatElement, data.hat, bodyPivot, data.body.anchors[data.hat.anchor_type], scale, data);
        if (data.accessory) {
          $scope.placePart(accessoryElement, data.accessory, bodyPivot, data.body.anchors[data.accessory.anchor_type], scale, data);
        }
        if (data.jewel) {
          $scope.placePart(jewelElement, data.jewel, bodyPivot, data.body.anchors[data.jewel.anchor_type], scale, data);
        }
        $scope.placePart(nageoireElement, data.body.nageoire, bodyPivot, data.body.anchors[data.body.nageoire.anchor_type], scale, data);
      }
    };

    $scope.updateNewPoisson = () => {
      if ($scope.currentTab === 'creation') {
        $scope.updatePoisson(0.5, $scope.newPoissonData, '.newPoisson');
      }
    };

    $scope.displayPoissonInfo = (poisson) => {
      $scope.selectedPoisson = poisson;
    };

    $scope.placePart = (elt, data, bodyPivot, anchor, scale, poissonData) => {
      elt.style.width = data.width * scale * anchor.scale + 'px';
      elt.style.height = data.height * scale * anchor.scale + 'px';
      let innerSvg = elt.querySelector('svg');
      if (innerSvg) {
        innerSvg.style.width = data.width * scale * anchor.scale + 'px';
        innerSvg.style.height = data.height * scale * anchor.scale + 'px';
        innerSvg.style.animationDelay = -Math.random() * 10 + 's';
        innerSvg.style.transformOrigin =
          `${data.pivot.x * scale * anchor.scale}px ${data.pivot.y * scale * anchor.scale}px`;
      } else {
        if (poissonData.observer) {
          poissonData.observer.disconnect();
        }
        poissonData.observer = new MutationObserver(() => {
          if (elt.querySelector('svg')) {
            elt.querySelector('svg').style.animationDelay = -Math.random() * 10 + 's';
            elt.querySelector('svg').style.transformOrigin =
              `${data.pivot.x * scale * anchor.scale}px ${data.pivot.y * scale * anchor.scale}px`;
            elt.querySelector('svg').style.width = data.width * scale * anchor.scale + 'px';
            elt.querySelector('svg').style.height = data.height * scale * anchor.scale + 'px';
          }
        });
        poissonData.observer.observe(elt, { childList: true });
      }
      elt.style.left = bodyPivot.x + anchor.x * scale + 'px';
      elt.style.top = bodyPivot.y + anchor.y * scale + 'px';
      elt.style.transform =
        `translate(-${data.pivot.x * scale * anchor.scale}px, -${data.pivot.y * scale *
        anchor.scale}px) rotate(${anchor.angle + (data.angle ? data.angle : 0)}deg)`;
    };

    $scope.randomizePoisson = () => {
      for (let cat in $scope.data) {
        let r = Math.floor(Math.random() * $scope.data[cat].length);
        switch (cat) {
          case 'poissons':
            $scope.selectPart('body', $scope.data[cat][r]);
            break;
          case 'yeux':
            $scope.selectPart('eye', $scope.data[cat][r]);
            break;
          case 'chapeaux':
            $scope.selectPart('hat', $scope.data[cat][r]);
            break;
          case 'accessoires':
            $scope.selectPart('accessory', $scope.data[cat][r]);
            r = Math.floor(Math.random() * $scope.data[cat].length);
            $scope.selectPart('jewel', $scope.data[cat][r]);
            break;
          case 'colors':
            $scope.selectPart('color', $scope.data[cat][r]);
            break;
        }
      }
      $scope.updateNewPoisson();
    };

    $scope.closeCreationPopup = () => {
      $scope.popupCreation = false;
      $scope.creationInformation = false;
    };

    $scope.openCreationValidation = () => {
      $scope.popupCreation = true;
      eventsFactory.solsticeUlmo.getCreationInfos().then(data => {
        $scope.creationInformation = data.data;
      });
    };

    $scope.createPoisson = () => {
      $scope.closeCreationPopup();
      eventsFactory.solsticeUlmo.createPoisson({
        name: $scope.newPoisson.name,
        body_id: $scope.newPoisson.body_id,
        jewel_id: $scope.newPoisson.jewel_id,
        accessory_id: $scope.newPoisson.accessory_id,
        cap_id: $scope.newPoisson.cap_id,
        eye_id: $scope.newPoisson.eye_id,
        colors: $scope.newPoisson.colors.split('/')
      }).then(data => {
        $rootScope.setAlert('success', data.data.name + " a rejoint l'aquarium !");
        $scope.currentTab = 'aquarium';
      }).catch($rootScope.handleError);
    };

    $scope.feedCurrentPoisson = () => {
      eventsFactory.solsticeUlmo.feedPoisson($scope.selectedPoisson.id).then(data => {
        $rootScope.setAlert('success', $scope.selectedPoisson.name + ' est rassasié !');
        $scope.openPopup('feed');
      }).catch($rootScope.handleError);
    };

    $scope.favorCurrentPoisson = () => {
      eventsFactory.solsticeUlmo.favorPoisson($scope.selectedPoisson.id).then(data => {
        $rootScope.setAlert('success', 'Vous commencez à exaucer le souhait de ' + $scope.selectedPoisson.name);
        $scope.closePopup();
      }).catch((e) => {
        $scope.closePopup();
        $rootScope.handleError(e);
      });
    };

  }
]);

angular.module('app').directive('poissonSolstice', function () {
  return {
    restrict: 'A',
    scope: {
      scale: '=scale',
      poisson: '=poisson'
    },
    link: function ($scope, $element) {
      $scope.$parent.updatePoisson($scope.scale, $scope.poisson, "#poisson-" + $scope.poisson.id);
      $element[0].style.top = Math.random() * (450 - $scope.poisson.body.height * $scope.scale) + 'px';
      $element[0].style.setProperty('--rightMax', (800 - $scope.poisson.body.width * $scope.scale) + 'px');
      let duration = Math.random() * 10 + 15;
      $element[0].style.animationDelay = -Math.random() * duration + 's';
      $element[0].style.animationDuration = duration + 's';
      $element[0].addEventListener('click', () => {
        $scope.$parent.displayPoissonInfo($scope.poisson);
      });
    }
  }
});

angular.module('app').component('svgElement', {
  templateUrl: myLocalized.partials + 'svgelement.html',
  bindings: {
    iconUrl: '<',
    colorPair: '<'
  },
  controllerAs: 'svgCtrl',
  controller: [
    '$scope', '$element', '$rootScope', '$http', function ($scope, $element, $rootScope, $http) {
      this.$onInit = () => {
        if (this.iconUrl != null) {
          var ajax = new XMLHttpRequest();
          ajax.open("GET", this.iconUrl, true);
          ajax.send();
          ajax.onload = this.onLoad.bind(this, ajax);
        }
      };

      this.onLoad = (ajax) => {
        hensApp.removeAllChildren($element[0]);
        if (ajax.responseText.indexOf('404 Not Found') >= 0) {
          console.warn('invalid response', ajax.responseText);
        } else {
          $element[0].innerHTML = ajax.responseText;
          if (this.colorPair) {
            let [mainColor, accentColor] = this.colorPair.split('/');
            $element[0].querySelectorAll('.main-color').forEach(main => main.style.fill = mainColor);
            $element[0].querySelectorAll('.accent-color').forEach(accent => accent.style.fill = accentColor);
          }
          if (!$element[0].querySelector('svg')) {
            console.warn('fock', this);
            return;
          }
          $element[0].querySelector('svg').style.width = $element[0].style.width;
          $element[0].querySelector('svg').style.height = $element[0].style.height;
        }
      };

      this.$onChanges = (changes) => {
        if (this.iconUrl) {
          var ajax = new XMLHttpRequest();
          ajax.open("GET", this.iconUrl, true);
          ajax.send();
          ajax.onload = this.onLoad.bind(this, ajax);
        }
      }
    }
  ]
});