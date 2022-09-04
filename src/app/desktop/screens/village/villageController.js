hensApp.controller('Village', [
  '$compile', '$scope', 'localeFactory', '$routeParams', '$rootScope', 'PropActions', 'eventsFactory', '$location',
  function ($compile, $scope, localeFactory, $routeParams, $rootScope, PropActions, eventsFactory, $location) {
    $scope.$parent.info.isAppInit = false;

    /* Utilities class for shared methods with mobile version */
    $scope.villageUtils = new VillageUtils($scope, $rootScope, localeFactory, eventsFactory, $location, $compile);

    /** Pixel height of the site-wide header */
    $scope.headerHeight = 80;

    /** Etat d'affichage du profil de personnage de contrib. */
    $scope.showProfil = false;

    /** Etat du drag & drop à la souris pour déplacer la map. */
    $scope.dragging = false;

    /** Nom effectif de la zone affichée. */
    $scope.effectiveZone = null;

    /*render scale of the map */
    $scope.mapScale = 1;

    $scope.mapVillageElement = document.querySelector('.map-village');
    $scope.eventWrapper  = document.querySelector('.event_wrappers');
    $scope.villageLocaElement = document.querySelector('.village__loca');

    /**
     * This is an array events can populate with functions that will be executed when a tile is loaded.
     * This will let these handle necessary display changes to be made in their respectives elements.
     * @type {Array}
     */
    $scope.tileLoadEventsHandlers = [];

    $scope.mapState = {
      showProfil: false,  // show selected character profile
      showArticles: false, //show selected location profile
      showMinimap: true,
      showLocations: true,
      fixed: false, //disabled arrow movement
      disabled: false, // disable drag & drop + mini map
      obfuscated: false, // loads without blurred pîcture
      showCharacters: true, // are characters shown
      showHouses: true, // are houses shown
      autoFocus: false, //toggles auto focusing the closest location after 3s of inactivity
    };

    /** Position de la map. */
    $scope.mapOffset = {
      x: 0,
      y: 0
    };

    $scope.propJson = [];
    $scope.persoJson = [];
    $scope.isLoading = true;
    $scope.currentProfil = false;
    $scope.smoothingFps = 1000 / 60;

    $scope.mapOffset = {
      x: 0,
      y: 0
    };

    $scope.keyState = {
      up: false,
      left: false,
      right: false,
      down: false
    };

    /** L'évènement contextuel d'ouverture de la map. */
    $scope.mapEvent = $routeParams.eventname;

    $scope.getMapPos = () => ({
      x: -parseInt($scope.mapVillageElement.style.getPropertyValue("--offsetLeft").replace('px', '')),
      y: -parseInt($scope.mapVillageElement.style.getPropertyValue("--offsetTop").replace('px', ''))
    });

    $scope.getRealMapPos = () => {
      return {
        x: $scope.currentRealMapPos.x,
        y: $scope.currentRealMapPos.y
      };
    };

    //external changes
    $scope.$on('setMapState:showArticles', (event, state, locaSlug) => {
      $scope.mapState.showArticles = state;
      let location = $scope.vData.locations.find(loca => loca.slug === locaSlug);
      if (location) {
        location.isOpen = state;
      }
    });

    /** move map to X/Y position, anchor is top left of screen **/
    $scope.moveMapTo = function (x, y) {
      x = x.clamp(0, $scope.vData.width * $scope.mapScale - window.innerWidth);
      y = y.clamp(0, $scope.vData.height * $scope.mapScale - window.innerHeight + $scope.headerHeight);

      $scope.mapOffset.x = -x;
      $scope.mapOffset.y = -y;
      requestAnimationFrame(() => {
        $scope.updateMapPos();
        $scope.villageUtils.loadZone();
      });
    };

    /** move map to X/Y position, anchor is center left, displayed with right panel opened */
    $scope.moveMapToAsSelected = function (x, y) {
      console.log("move map to as selected BEFORE", x, y);
      x -= (window.innerWidth - 800) / 2;
      y -= ($(window).height() / 3);
      $scope.moveMapTo(x, y);
    }

    /** This is an update function for real map pos during transitions. Does not move cursor **/
    $scope.setRealMapPos = function (x, y) {
      x = Math.ceil(x.clamp(0, $scope.vData.width - $(window).width()));
      y = Math.ceil(y.clamp(0, $scope.vData.height - $(window).height() + $scope.headerHeight));

      $scope.mapVillageElement.style.setProperty("--offsetLeft", -x);
      $scope.mapVillageElement.style.setProperty("--offsetTop", -y);
      $scope.villageLocaElement.style.setProperty('--offsetLeft', -x);
      $scope.villageLocaElement.style.setProperty('--offsetTop', -y);
      $scope.eventWrapper.style.setProperty('--offsetLeft', -x);
      $scope.eventWrapper.style.setProperty('--offsetTop', -y);

    };

    /** Forces map pos to a position **/
    $scope.setMapPos = function (x, y) {
      x = Math.ceil(x);
      y = Math.ceil(y);
      $scope.moveMapTo(x, y);
      $scope.mapVillageElement.style.setProperty("--offsetLeft", $scope.mapOffset.x);
      $scope.mapVillageElement.style.setProperty("--offsetTop", $scope.mapOffset.y);
      $scope.villageLocaElement.style.setProperty('--offsetLeft', $scope.mapOffset.x);
      $scope.villageLocaElement.style.setProperty('--offsetTop', $scope.mapOffset.y);
      $scope.eventWrapper.style.setProperty('--offsetLeft', $scope.mapOffset.x);
      $scope.eventWrapper.style.setProperty('--offsetTop', $scope.mapOffset.y);
    };

    /** Moves the map by an amount of pixels dx and dy */
    $scope.moveMapWithDelta = function (dx, dy) {
      $scope.isLoading = true;
      $scope.mapOffset.x = (dx + $scope.mapOffset.x).clamp(-($scope.vData.width - $(window).width()), 0);
      $scope.mapOffset.y =
        (dy + $scope.mapOffset.y).clamp(-($scope.vData.height - ($(window).height() - $scope.headerHeight)), 0);

      requestAnimationFrame(() => {
        $scope.updateMapPos();
        $scope.villageUtils.loadZone();
      });
    };

    $scope.smoothingRatio = 24;
    $scope.mapSmoothing = function () {
      clearInterval($scope.interval);
      $scope.interval = setInterval(function () {
        if (!$scope.mapState.fixed) {
          if ($scope.keyState.top) {
            $scope.moveMapWithDelta(0, $scope.vData.speed);
          } else if ($scope.keyState.down) {
            $scope.moveMapWithDelta(0, -$scope.vData.speed);
          }
          if ($scope.keyState.left) {
            $scope.moveMapWithDelta($scope.vData.speed, 0);
          } else if ($scope.keyState.right) {
            $scope.moveMapWithDelta(-$scope.vData.speed, 0);
          }
        }
        const mapPos = $scope.getMapPos();
        const x = -mapPos.x;
        const y = -mapPos.y;
        if ((Math.abs(x - $scope.mapOffset.x) > 0.1) || (Math.abs(y - $scope.mapOffset.y) > 0.1)) {
          const deltaX = x - $scope.mapOffset.x;
          const deltaY = y - $scope.mapOffset.y;
          if (!$scope.isLoading && (Math.abs((deltaX)) < 12)) {
            $scope.isLoading = true;
          }
          const newX = x - Math.ceil((deltaX) / $scope.smoothingRatio);
          const newY = y - Math.ceil((deltaY) / $scope.smoothingRatio);
          $scope.setRealMapPos(-newX, -newY);

          $scope.currentRealMapPos = {
            x: -newX,
            y: -newY,
          };
          return $scope.updateMapPos();
        } else {
          $scope.currentRealMapPos = {
            x: mapPos.x,
            y: mapPos.y,
          };
        }
      }, $scope.smoothingFps);
    };

    /** Updates minimap position */
    $scope.updateMapPos = function () {
      if ($scope.vData) {
        let minimapWidthRatio = $scope.vData.miniMap.width / $scope.vData.width;
        let minimapHeightRatio = $scope.vData.miniMap.height / $scope.vData.height;
        //size
        $('.mini-screen').css('width', -4 + ($(window).width() * minimapWidthRatio));
        $('.mini-screen').css('height', -4 + (($(window).height() - $scope.headerHeight) * minimapHeightRatio));
        $('.mini-screen').css('left', -$scope.mapOffset.x * minimapWidthRatio);
        $('.mini-screen').css('top', -$scope.mapOffset.y * minimapHeightRatio);
      }
    };

    $scope.getHot = function () {
      if (($rootScope.globalPostList !== undefined) && ($scope.vData !== undefined)) {
        for (let post of Array.from($rootScope.globalPostList)) {
          if (post.isHot && post.village.slug === $routeParams.village) {
            for (let loca of Array.from($scope.vData.locations)) {
              if (post.village.slug === loca.slug) {
                loca.isHot = true;
                if (loca.hotCount === undefined) {
                  loca.hotCount = 1;
                } else {
                  loca.hotCount++;
                }
              }
            }
          }
        }
      } else {
        setTimeout($scope.getHot, 100);
      }
    }

    $scope.hideList = () => {
      $scope.mapState.showArticles = false;
    }

    $scope.displayMiniMap = function () {
      let url = myLocalized.medias + `map/${$scope.village}/${$scope.effectiveFolder}`;
      if ($scope.district) {
        url += `_${$scope.district}`;
      }
      url += `/minimap-${$scope.mapTime}.jpg`;
      $('.mini-map').css('background-image', `url(${url})`);
      $('.mini-map').css('width', $scope.vData.miniMap.width);
      $('.mini-map').css('height', $scope.vData.miniMap.height);
      if ($scope.vData.miniMap.width < 150) {
        $('.mini-map').css('margin-left', (150 - $scope.vData.miniMap.width) / 2);
      }
      return $scope.enableMiniMapMove();
    };

    $scope.enableButtonMove = function () {
      const moveButton = $('.move-button');
      moveButton.mousedown(function (e) {
        if ($(this).hasClass('left')) {
          $scope.keyState.left = true;
        }
        if ($(this).hasClass('top')) {
          $scope.keyState.top = true;
        }
        if ($(this).hasClass('right')) {
          $scope.keyState.right = true;
        }
        if ($(this).hasClass('down')) {
          return $scope.keyState.down = true;
        }
      });
      moveButton.mouseup(e => {
        for (let key in $scope.keyState) {
          const value = $scope.keyState[key];
          $scope.keyState[key] = false;
        }
      });
      moveButton.mouseout(e => {
        for (let key in $scope.keyState) {
          const value = $scope.keyState[key];
          $scope.keyState[key] = false;
        }
      });
    }

    //on minimap click
    $scope.mapMove = function (e) {
      $scope.isLoading = true;
      const target = e.currentTarget.classList[0];
      const miniWidth = parseInt($('.mini-screen').css('width').replace('px', ''));
      const miniHeight = parseInt($('.mini-screen').css('height').replace('px', ''));
      const offset = $(e.currentTarget).offset();
      const offsetX = e.pageX - offset.left;
      const offsetY = e.pageY - offset.top;
      let x = ((offsetX - (miniWidth / 2)) / $scope.vData.miniMap.width) * $scope.vData.width;
      let y = ((offsetY - (miniHeight / 2)) / $scope.vData.miniMap.height) * $scope.vData.height;
      $scope.moveMapTo(x, y);
    };

    $scope.enableMiniMapMove = function () {
      $scope.updateMapPos();
      const color = {
        ulmo: "#10e4dd",
        sulimo: "#e58c00",
        wilwar: "#233a06",
        anar: "#db2f00"
      };
      $('.move-button').mouseover(function (e) {
        return $(this).css('background-color', color[$scope.village]);
      });
      $('.move-button').mouseout(function (e) {
        return $(this).css('background-color', "#333");
      });

      $('.mini-screen').css('border', `2px solid ${color[$scope.village]}`);

      return $('.mini-map').click(e => $scope.mapMove(e));
    };

    $scope.goToOwner = function (slug) {
      $scope.goTo = `perso-${slug}`;
      $scope.goToPerso();
    };

    $scope.goToPerso = () => {
      setTimeout(function () {
        $scope.villageUtils.openPerso($scope.goTo.replace('perso-', ''));
      }, 150);
    }

    // ************ Animation ***********
    /**
     * Instancie dans le DOM les props chargés.
     * @param cb le callback une fois les props instanciés
     */
    $scope.countJsonProp = function (cb) {
      if ($scope.propJson.length === $scope.propLoadList.length) {
        setTimeout(function () {
          for (let prop of Array.from($scope.propLoadList)) {
            if (prop.list && prop.list.length > 0) {
              let chosenIndex = Math.floor(Math.random() * prop.list.length);// used for random pos
              for (let index = 0; index < prop.list.length; index++) {
                const propInstance = prop.list[index];
                const propElt = $(`.${prop.label}-${prop.listId}-${index}`);
                if (propElt) {
                  //random positoins only allows one of the possibilities to be displayed at a time
                  if (!prop.random_position || chosenIndex === index) {
                    propElt.css('width', prop.width);
                    propElt.find('.sprite').css('width', prop.width);
                    propElt.css('height', prop.height);
                    propElt.find('.sprite').css('height', prop.height);
                    propElt.css('left', propInstance.x - prop.center.x);
                    propElt.css('top', propInstance.y - prop.center.y);
                    const imgUrl = myLocalized.medias + `map/${$scope.village}/${$scope.effectiveFolder +
                    ($scope.district ? "_" + $scope.district :
                      "")}/props/${prop.label}/${$scope.mapTime}/${prop.label}.png`;
                    propElt.find('.sprite').css('background', `url('${imgUrl}')`);
                  } else {
                    if (prop.random_position) {
                      propElt.css('display', 'none');
                    }
                  }
                }
              }
            } else {
              let propInstance = prop.avail[prop.availIndex];
              const propElt = $(`.${prop.label}-${prop.listId}-0`);
              propElt
                .css('width', prop.width)
                .css('height', prop.height)
                .css('left', propInstance.x - prop.center.x)
                .css('top', propInstance.y - prop.center.y);
              propElt.find('.sprite')
                .css('width', prop.width)
                .css('height', prop.height);
              const imgUrl = myLocalized.medias + `map/${$scope.village}/${$scope.effectiveFolder +
              ($scope.district ? "_" + $scope.district : "")}/props/${prop.label}/${$scope.mapTime}/${prop.label}.png`;
              propElt.find('.sprite').css('background', `url('${imgUrl}')`);
            }
          }
          if (cb) {
            cb();
          }
        }, 150);
      }
    };

    $scope.countJsonPerso = function (cb) {
      if ($scope.persoJson.length === $scope.contribLoadList.length) {
        setTimeout(function () {
          //to move at contrib count json
          let current, selector, element;
          for (let contrib of Array.from($scope.contribLoadList)) {
            current = contrib.avail[contrib.availIndex];
            const {posSlug} = current;
            selector = `.${contrib.slug}-${posSlug}`;
            element = $(selector);
            if (element) {
              element.css('width', current.width);
              element.css('height', current.height);
              const imgUrl = myLocalized.medias + `map/${$scope.village}/${$scope.effectiveFolder +
              ($scope.district ? "_" + $scope.district :
                "")}/persos/${contrib.slug}/${posSlug}/${$scope.mapTime}/${contrib.slug}_${posSlug}.png`;
              $(selector).css('background', `url('${imgUrl}')`);
            }
          }
          for (var home of Array.from($scope.houseMainList)) {
            current = home.house;
            selector = `.home-main-${home.slug}`;
            element = $(selector);
            if (element) {
              element.css('width', current.width);
              element.find('.home-label').css('margin-left', (current.width - 100) / 2);
              element.find('.curseur').css('margin-left', (current.width - 40) / 2);
              element.css('height', current.height);
              element.css('left', current.x);
              element.css('top', current.y);
            }
          }
          for (home of Array.from($scope.houseEmptyList)) {
            current = home.house;
            selector = `.home-empty-${home.slug}`;
            let element = $(selector);
            if (element) {
              element.css('width', current.width);
              element.find('.home-label').css('margin-left', (current.width - 100) / 2);
              element.css('height', current.height);
              element.css('left', current.x);
              element.css('top', current.y);
            }
          }
          if (cb) {
            cb();
          }
        }, 150);
      }
    };

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

    $scope.startPropAnim = () => {
      if (!$scope.propInterval) {
        $scope.propInterval = setInterval(() => {
          for (let prop of $scope.propLoadList.filter(prop => $scope.mapState.showCharacters || !prop.action)) {
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
     * Initialise le comportement drag & drop.
     */
    $scope.initDragAndDrop = () => {
      $('.village__wrapper').mousedown(function (e) {
        if (!$scope.mapState.disabled && !e.target.classList.contains('move-button') &&
          !e.target.classList.contains('mini-map') && !e.target.classList.contains('mini-screen')) {
          $scope.dragging = true;
          $scope.initialMapPos = $scope.getMapPos();
          $scope.mapOffset.x = -$scope.initialMapPos.x;
          $scope.mapOffset.y = -$scope.initialMapPos.y;
          $scope.initialDragPos = {
            x: e.screenX,
            y: e.screenY
          };
        }
      });

      $(document).mouseup(function (e) {
        if ($scope.dragging) {
          $scope.dragging = false;

          //forced to timeout end of dragging, due to angularJS mouse events being fired after jquery mouse listeners
          setTimeout(() => {
            $scope.draggingEffective = false;
          });

          const newPos = {
            x: (($scope.initialDragPos.x + $scope.initialMapPos.x) - e.screenX),
            y: (($scope.initialDragPos.y + $scope.initialMapPos.y) - e.screenY)
          };
          $scope.setMapPos(newPos.x, newPos.y);
        }
      });
      window.onblur = function () {
        if ($scope.dragging) {
          $scope.dragging = false;
          const newPos = {
            x: (($scope.initialDragPos.x + $scope.initialMapPos.x) - e.screenX),
            y: (($scope.initialDragPos.y + $scope.initialMapPos.y) - e.screenY)
          };
          $scope.setMapPos(newPos.x, newPos.y);
        }
      };
      window.onmousemove = function (e) {
        if ($scope.dragging) {
          $scope.draggingEffective = true;
          const newPos = {
            x: (($scope.initialDragPos.x + $scope.initialMapPos.x) - e.screenX),
            y: (($scope.initialDragPos.y + $scope.initialMapPos.y) - e.screenY)
          };
          $scope.setMapPos(newPos.x, newPos.y);
          $scope.updateMapPos();
        }
      };
    };
    /**
     * Initalise les event handlers .
     */
    $scope.bindEvents = function () {
      $(window).on('resize', () => $scope.updateMapPos());
      $(window).keydown(function (e) {
        if ($scope.mapState.showArticles || $scope.mapState.showProfil) return;
        if (e.keyCode === 40) { // bottom
          $scope.keyState.down = true;
        }
        if (e.keyCode === 38) { // top
          $scope.keyState.top = true;
        }
        if (e.keyCode === 39) { //right
          $scope.keyState.right = true;
        }
        if (e.keyCode === 37) { //left
          return $scope.keyState.left = true;
        }
      });

      $(window).keyup(function (e) {
        if (e.keyCode === 40) { // bottom
          $scope.keyState.down = false;
        }
        if (e.keyCode === 38) { // top
          $scope.keyState.top = false;
        }
        if (e.keyCode === 39) { //right
          $scope.keyState.right = false;
        }
        if (e.keyCode === 37) { //left
          $scope.keyState.left = false;
        }
      });
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

    $scope.initMap = function () {
      $scope.confirmed = true;
      $scope.villageUtils.initVillageData().then(() => {
        $scope.displayMiniMap();
        $scope.enableButtonMove();
        $scope.initDragAndDrop();
        $scope.bindEvents();
        $scope.mapSmoothing();
        $scope.updateMapPos();
        $scope.$parent.info.isAppInit = true;
      });
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

    $scope.storeHoveredProp = (prop, event) => {
      $scope.hoveredProp = prop;
      if (prop.prop_hover && prop.prop_hover === "prop_message") {
        event.currentTarget.classList.add("prop_message");
      }
      switch (prop.action) {
        case 'open_equinoxe_instrument':
          $scope.hoveredInstrument = prop;
          break;
        default:
          $scope.hoveredInstrument = null;
          break;
      }
    };

    $scope.deleteHoveredProp = (event) => {
      event.currentTarget.classList.remove("prop_message");
      $scope.hoveredProp = null;
      $scope.hoveredInstrument = null;
    };

    $scope.init = function () {
      switch ($routeParams.eventname) {
        case 'carnaval-cachette':
          $scope.showLocations = false;
          $scope.mapState.showCharacters = false;
          break;
        default:
          $scope.showLocations = true;
          $scope.mapState.showCharacters = true;
      }
      if ($routeParams.location !== undefined) {
        $scope.goTo = $routeParams.location;
      }
      $scope.village = $routeParams.village;
      $scope.zone = $routeParams.zone;
      $scope.effectiveZone = $scope.zone.indexOf('village') === 0 ? $scope.village : $scope.zone;
      $scope.effectiveFolder = $scope.effectiveZone === $scope.village ? 'village' : $scope.effectiveZone;
      $scope.villageUtils.setTime();
      $scope.getHot();
      $scope.preload = new createjs.LoadQueue(true);
      $scope.preload.on('fileload', $scope.villageUtils.handleFileLoad);

      if ($routeParams.village === 'anar') {
        $scope.initAnar();
      } else {
        $scope.initMap();
      }
    };

    $scope.$on('destroyCurrentInstrument', () => {
      $scope.currentInstrument = null;
      $scope.mapState.disabled = false;
    });

    $scope.toggleMapShow = () => $scope.mapState.show = !$scope.mapState.show;

    $scope.$on('$destroy', function () {
      clearInterval($scope.interval);
      clearInterval($scope.loadCheckerInterval);
      clearInterval($scope.persoInterval);
      clearInterval($scope.propInterval);
    });

    $scope.init();

  }
]);