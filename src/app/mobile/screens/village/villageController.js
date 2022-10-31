hensApp.controller('Village', [
  '$scope', '$rootScope', 'localeFactory', '$routeParams', 'PropActions', 'eventsFactory', '$compile', '$location',
  function ($scope, $rootScope, localeFactory, $routeParams, PropActions, eventsFactory, $compile, $location) {
    $scope.$parent.info.isAppInit = false;

    /** Utilities class for shared methods with mobile version */
    $scope.villageUtils = new VillageUtils($scope, $rootScope, localeFactory, eventsFactory, $location, $compile);

    /** Pixel height of the site-wide header */
    $scope.headerHeight = 80;

    /** List of props displayed in map **/
    $scope.propJson = [];

    /** character list data for map display **/
    $scope.persoJson = [];

    /** Currently selected character profile **/
    $scope.currentProfil = null;

    /** Loading State ? **/
    $scope.isLoading = true;

    /** Etat du drag & drop à la souris pour déplacer la map. */
    $scope.dragging = false;

    /** Nom effectif de la zone affichée. */
    $scope.effectiveZone = null;

    /** ratio for speed at which map is smoothing its positions */
    $scope.smoothingRatio = 24;
    $scope.smoothingFps = 1000 / 60;
    /** frame at which map smoothing starts.  In mobile, smoothing is slow at first, then accelerates up to a point. */
    $scope.smoothingFrameStart = 0;
    $scope.smoothingAccelerationDelay = 1200;

    /*render scale of the map */
    $scope.mapScale = 0.65;

    $scope.mapVillageElement = document.querySelector('.map-village');


    $scope.$watch("mapState.showCharacters", () => {
      if ($scope.mapState.showCharacters) {
      }
    });

    //parameters popup state (lets you config autFocus, showCharacters, ...)
    $scope.parametersOpen = false;

    $scope.mapState = {
      showProfil: false,  // show selected character profile
      showArticles: false, //show selected location profile
      showLocations: true,
      fixed: false, //disabled arrow movement
      disabled: false, // disable drag & drop + mini map
      obfuscated: false, // loads without blurred pîcture
      showCharacters: false, // are characters shown
      showHouses: false, // are houses shown
      autoFocus: true, //toggles auto focusing the closest location after 3s of inactivity
    };

    /**
     * This is an array events can populate with functions that will be executed when a tile is loaded.
     * This will let these handle necessary display changes to be made in their respectives elements.
     * @type {Array}
     */
    $scope.tileLoadEventsHandlers = [];

    /** Position de la map (sans prendre en compte les transitions. */
    $scope.mapOffset = {
      x: 0,
      y: 0
    };

    //external changes
    $scope.$on('setMapState:showArticles', (event, state, locaSlug) => {
      $scope.mapState.showArticles = state;
      let location = $scope.vData.locations.find(loca => loca.slug === locaSlug);
      if (location) {
        location.isOpen = state;
      }
    });

    /**
     * MAP MANIPULATION
     */
    $scope.getMapPos = () => ({
      x: -parseInt($('.map-village').css('margin-left').replace('px', '')),
      y: -parseInt($('.map-village').css('margin-top').replace('px', ''))
    });

    /** move map to X/Y position, anchor is top left of screen **/
    $scope.moveMapTo = function (x, y) {
      x = x.clamp(0, $scope.vData.width * $scope.mapScale - $(window).width());
      y = y.clamp(0, $scope.vData.height * $scope.mapScale - $(window).height() + $scope.headerHeight);

      $scope.mapOffset.x = -x;
      $scope.mapOffset.y = -y;
      $scope.launchClosestLocationDetection();
      requestAnimationFrame(() => {
        $scope.villageUtils.loadZone();
      });
    };

    /** move map to X/Y position, anchor is center left, displayed with right panel opened */
    $scope.moveMapToAsSelected = function (x, y) {
      x -= (window.innerWidth) / 2;
      y -= (window.innerHeight / 4);
      $scope.moveMapTo(x, y);
    }

    /** This is an update function for real map pos during transitions. Does not move cursor **/
    $scope.setRealMapPos = function (x, y) {
      x = Math.ceil(x.clamp(0, $scope.vData.width - $(window).width()));
      y = Math.ceil(y.clamp(0, $scope.vData.height - $(window).height() + $scope.headerHeight));

      $('.map-village').css('margin-left', -x);
      $('.map-village').css('margin-top', -y);
      $('.village__loca').css('margin-left', -x);
      $('.village__loca').css('margin-top', -y);
    };

    /** Forces map pos to a position **/
    $scope.setMapPos = function (x, y) {
      x = Math.ceil(x);
      y = Math.ceil(y);
      $scope.moveMapTo(x, y);
      $('.map-village').css('margin-left', $scope.mapOffset.x);
      $('.map-village').css('margin-top', $scope.mapOffset.y);
      $('.village__loca').css('margin-left', $scope.mapOffset.x);
      $('.village__loca').css('margin-top', $scope.mapOffset.y);
    };


    $scope.closestDetectionTimeout = -1;
    $scope.launchClosestLocationDetection = () => {
      if ($scope.mapState.showArticles) return;
      clearTimeout($scope.closestDetectionTimeout);
      $scope.closestDetectionTimeout = setTimeout(() => {
        //prevent autofocus if option is disabled
        if (!$scope.mapState.autoFocus) return;

        let closestLocation;
        let closestDistance;
        $scope.vData.locations.forEach((location) => {
          let x = location.pos.x + (location.width / 2);
          let y = location.pos.y + (location.height / 2);
          let screenX = -$scope.mapOffset.x + window.innerWidth / 2;
          let screenY = -$scope.mapOffset.y + window.innerHeight / 2;
          let distance = Math.pow(Math.abs(screenX - x), 2) + Math.pow(Math.abs(screenY - y), 2);

          // console.log('found distance for: l/x/y/d', location.label, x, y , distance);
          if (closestDistance == null || closestDistance > distance) {
            closestDistance = distance;
            closestLocation = location;
          }
        });
        if (Math.sqrt(closestDistance) < Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) / 3) {
          let x = closestLocation.pos.x + (closestLocation.width / 2);
          let y = closestLocation.pos.y;

          let previousX = $scope.mapOffset.x;
          let previousY = $scope.mapOffset.y;
          $scope.moveMapToAsSelected(x, y);
          if (previousX === $scope.mapOffset.x && previousY === $scope.mapOffset.y) return;
          setTimeout(() => {
            $scope.villageUtils.displayLocationCreations(closestLocation, true);
          }, 300);
        }

      }, 3000);
    };



    /**
     * Main map update loop
     */

    $scope.mapSmoothing = function () {
      clearInterval($scope.interval);
      $scope.interval = setInterval(function () {
        const mapPos = $scope.getMapPos();
        const x = -mapPos.x;
        const y = -mapPos.y;
        if ((Math.abs(x - $scope.mapOffset.x) > 1) || (Math.abs(y - $scope.mapOffset.y) > 1)) {
          if ($scope.smoothingFrameStart == - 1) {
            $scope.smoothingFrameStart = +new Date();
          }
          let amount = Math.min(1, (+new Date() - $scope.smoothingFrameStart) / $scope.smoothingAccelerationDelay);
          let deltaX = x - $scope.mapOffset.x;
          let deltaY = y - $scope.mapOffset.y;
          if (!$scope.isLoading && (Math.abs((deltaX)) < 12 || Math.abs((deltaY)) < 12)) {
            $scope.isLoading = true;
          }
          deltaX = hensApp.lerp(0, deltaX, amount) / $scope.smoothingRatio;
          deltaY = hensApp.lerp(0, deltaY, amount) / $scope.smoothingRatio;
          const newX = x - Math.ceil(Math.abs(deltaX)) * Math.sign(deltaX);
          const newY = y - Math.ceil(Math.abs(deltaY)) * Math.sign(deltaY);
          $scope.setRealMapPos(-newX, -newY);
        }
        else {
          $scope.smoothingFrameStart = -1;
        }
      }, $scope.smoothingFps);
    };

    /**
     * STATE MANIPULATION
     */

    $scope.hideList = () => {
      $scope.mapState.showArticles = false;
    }

    /**
     * MAP TILES LOADING HANDLERS
     */

    $scope.loadImage = function (id) {
      $(`.${id}`).addClass('loaded');
      $(`.${id}`).html("<div class='ajax-loader'></div>");
      let url = myLocalized.medias + `map/${$scope.village}/${$scope.effectiveFolder}`;
      if ($scope.district) {
        url += `_${$scope.district}/`;
      } else {
        url += "/";
      }
      url += `${$scope.season}/slice${$scope.mapTime}/images/${id}.jpg`;
      return $scope.preload.loadFile({
        src: url,
        id
      });
    };

    /**
     * Vérifie l'état de chargement de l'ensemble des images composant la map.
     */
    $scope.loadingCheck = function () {
      if ($scope.isLoading) {
        for (let image = 1, end = $scope.vData.sliceSize, asc = 1 <= end; asc ? image <= end : image >= end; asc ?
          image++ : image--) {
          var id;
          if (image < 10) {
            id = `${$scope.effectiveZone}_0${image}`;
          } else {
            id = `${$scope.effectiveZone}_${image}`;
          }
          const imageBlock = $(`.${id}`);
          if (!imageBlock.hasClass('displayed')) { //first display
            imageBlock.css('width', imageBlock.attr('width'));
            imageBlock.css('height', imageBlock.attr('height'));
            const randomGrey = `${parseInt(10 + (Math.random() * 8))}`;
            // $(".#{id}").css('background-color', "rgba(#{randomGrey},#{randomGrey},#{randomGrey},1)")
            imageBlock.addClass('displayed');
          }
          if (!imageBlock.hasClass('loaded')) {
            if ((imageBlock.offset().top > -imageBlock.attr('height')) &&
              (imageBlock.offset().left > -imageBlock.attr('width')) &&
              (imageBlock.offset().left < $(window).width()) && (imageBlock.offset().top < $(window).height())) {
              $scope.loadImage(id);
            }
          }
        }
      }
    };

    // elem needs a "quartier" property
    $scope.isInDistrict = elem => !($scope.district && (elem.quartier !== $scope.district));

    $scope.dateMatches = dateList => {
      let d;
      if (typeof dateList === 'string') {
        d = hensApp.parseDate(dateList);
        return (d[0] === $scope.day) && (d[1] === $scope.month);
      } else {
        return dateList.some(date => {
          if (typeof date === 'string') {
            d = hensApp.parseDate(date);
            return (d[0] === $scope.day) && (d[1] === $scope.month);
          } else {
            const d1 = hensApp.parseDate(date[0]);
            const d2 = hensApp.parseDate(date[1]);
            return hensApp.isDateBetween([$scope.day, $scope.month], d1, d2);
          }
        });
      }
    };

    // ************ Animation ***********
    /**
     * Lance la boucle d'animation pour les props.
     */
    $scope._propAnimation = function (selector, imageData) {
      let element = $(selector);
      if (element.length > 0) {
        let rect = element.offset();
        if ((rect.top > -element.height()) && (rect.left > -element.height()) && (rect.left < window.innerWidth) &&
          (rect.top < window.innerHeight)) {
          element.find('.village__prop-sprite, .village__perso-sprite').css('background-position', `${-imageData.frame.x}px ${-imageData.frame.y}px`);
        }
      }
    };

    $scope.toggleVillageOptions = () => {
      $scope.parametersOpen = !$scope.parametersOpen;
    }

    $scope.startPropAnim = () => {
      if (!$scope.propInterval) {
        $scope.propInterval = setInterval(() => {
          for (let prop of $scope.propLoadList) {
            let tp;
            for (let json of $scope.propJson) {
              const jsonImage = json.meta.image.replace('.png', '');
              if (jsonImage === prop.label) {
                tp = json;
              }
            }
            if (prop.list && prop.list.length > 0) {
              for (let index = 0; index < prop.list.length; index++) {
                const selec = `.${prop.label}-${prop.listId}-${index}`;
                $scope._propAnimation(selec, tp.frames[prop.animIndex]);
              }
            } else {
              const selec = `.${prop.label}-${prop.listId}-0`;
              $scope._propAnimation(selec, tp.frames[prop.animIndex]);
            }
            prop.animIndex++;
            if (prop.animIndex >= (tp.frames.length - 1)) {
              prop.animIndex = 0;
            }
          }
        }, 1000 / 10);
      }
    };

    /** Lance la boucle d'animation pour les persos. */
    $scope.startPersoAnim = () => {
      if (!$scope.persoInterval) {
        $scope.persoInterval = setInterval(() => {

          //prevent anim update if characters are not shown
          if (!$scope.mapState.showCharacters) return;

          for (let perso of $scope.contribLoadList) {
            var tp;
            for (let json of Array.from($scope.persoJson)) {
              const jsonImage = json.meta.image.replace('.png', '');
              if (jsonImage === (perso.slug + '_' + perso.avail[perso.availIndex].posSlug)) {
                tp = json;
              }
            }
            const selec = `.${perso.slug}-${perso.avail[perso.availIndex].posSlug}`;
            $scope._propAnimation(selec, tp.frames[perso.animIndex]);
            perso.animIndex++;
            if (perso.animIndex >= (tp.frames.length - 1)) {
              perso.animIndex = 0;
            }
          }
        }, 1000 / 12);
      }
    };

    $scope.checkActionForProp = prop => {
      if (prop.action && (PropActions[prop.action] != null)) {
        let result = PropActions[prop.action](prop, $scope.village, $scope.zone, $scope.district);
        switch (prop.action) {
          case 'open_equinoxe_instrument':
            $scope.currentInstrument = result;
            $scope.mapState.disabled = true;
            break;
          default:
            break;
        }
      }
    };

    /**
     * Initialisation spécifique à Anar pour le choix quartier ouest/est
     */
    $scope.initAnar = function () {
      if ($scope.goTo !== undefined) {
        let slug;
        if ($scope.goTo.indexOf('perso-') === 0) {
          slug = $scope.goTo.replace('perso-', '');
          localeFactory.JSON(`village/props/${$scope.effectiveZone}_props`).then(function (res) {
            const contribList = res.data.contribs;
            for (let contrib of Array.from(contribList)) {
              let formatContribSlug = contrib.slug.replace("'", "-");
              if (formatContribSlug === slug) {
                $scope.district = contrib.quartier;
                $scope.choosingAnar = false;
                $scope.confirmed = true;
                $scope.initDragAndDrop();
                $scope.initMap();
              }
            }
          });
        } else {
          localeFactory.JSON(`village/${$scope.effectiveZone}`).then(datas => {
            for (let location of Array.from(datas.data.locations)) {
              if (location.slug === $scope.goTo) {
                $scope.district = location.quartier;
                $scope.choosingAnar = false;
                $scope.confirmed = true;
                $scope.initDragAndDrop();
                $scope.initMap();
                break;
              }
            }
          });
        }
      } else if ($routeParams.quartier) {
        $scope.district = $routeParams.quartier;
        $scope.choosingAnar = false;
        $scope.confirmed = true;
        $scope.initDragAndDrop();
        $scope.initMap();
      } else {
        $scope.choosingAnar = true;
        $scope.$parent.info.isAppInit = true;
        $scope.confirmed = false;
        if (!$('#navBar').hasClass('hidden')) {
          $('#navBar').addClass('hidden');
        }
      }
    };

    /**
     * Choix du district (spécifique Anar).
     * @param side ouest | est
     */
    $scope.selectDistrict = function (side) {
      $scope.$parent.info.isAppInit = false;
      $scope.district = side;
      $scope.choosingAnar = false;
      $scope.confirmed = true;
      $scope.initDragAndDrop();
      $scope.initMap();
    };

    /**
     *  Initialization stuff
     *
     */

    $scope.getUniqueLocations = function () {
      const url = 'village/uniqueLocaList';
      return localeFactory.JSON(url);
    };

    $scope.initMap = function () {
      $scope.confirmed = true;
      $scope.villageUtils.initVillageData().then(() => {
        $scope.initDragAndDrop();
        $scope.mapSmoothing();
        $scope.$parent.info.isAppInit = true;
      }).catch($rootScope.handleError);
    };

    $scope.goToPerso = () => {
      setTimeout(function () {
        $scope.villageUtils.openPerso($scope.goTo.replace('perso-', ''));
      }, 150);
    }

    $scope.goToOwner = function (slug) {
      $scope.goTo = `perso-${slug}`;
      $scope.goToPerso();
    };

    /**
     * Initialise le comportement drag & drop.
     */
    $scope.villageWrapperElement = document.querySelector('.village__wrapper');
    $scope.initDragAndDrop = () => {
      $scope.villageWrapperElement.addEventListener("touchstart", (e) => {
        if (!$scope.mapState.disabled) {
          $scope.dragging = true;
          $scope.initialMapPos = $scope.getMapPos();
          $scope.setMapPos($scope.initialMapPos.x, $scope.initialMapPos.y);
          $scope.initialDragPos = {
            x: e.touches[0].pageX,
            y: e.touches[0].pageY
          };
        }
      });

      $scope.villageWrapperElement.addEventListener("touchmove", (e) => {
        if ($scope.dragging) {
          let deltaX = e.touches[0].pageX - $scope.initialDragPos.x;
          let deltaY = e.touches[0].pageY - $scope.initialDragPos.y;
          $scope.setMapPos($scope.initialMapPos.x - deltaX, $scope.initialMapPos.y - deltaY);
        }
      });

      $scope.villageWrapperElement.addEventListener("touchend", (e) => {
        $scope.dragging = false;
      });
    }

    $scope.init = function () {

      if ($routeParams.location !== undefined) {
        $scope.goTo = $routeParams.location;
      }
      $scope.village = $routeParams.village;
      $scope.zone = $routeParams.zone;
      $scope.effectiveZone = $scope.zone.indexOf('village') === 0 ? $scope.village : $scope.zone;
      $scope.effectiveFolder = $scope.effectiveZone === $scope.village ? 'village' : $scope.effectiveZone;
      $scope.villageUtils.setTime();
      //TODO: implement better get hot with dynamic queries ...
      // $scope.getHot();
      $scope.preload = new createjs.LoadQueue(true);
      $scope.preload.on('fileload', $scope.villageUtils.handleFileLoad);

      if ($routeParams.village === 'anar') {
        $scope.initAnar();
      } else {
        $scope.initMap();
      }
    };

    $scope.$on('$destroy', function () {
      console.warn('the map was correctly destroyed');
      clearInterval($scope.interval);
      clearInterval($scope.loadCheckerInterval);
      clearInterval($scope.persoInterval);
      clearInterval($scope.propInterval);
    });

    $scope.init();
  }
]);


