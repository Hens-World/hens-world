class HexaTile {
  constructor(data, clickHandle) {
    this.data = data;
    this.spriteSheet = this.data.spriteSheet;
    this.clickHandle = clickHandle;
    this.map = this.data.map;
    this.container = new createjs.Container();
    this.hitArea = new createjs.Shape();
    this.container.addChild(this.hitArea);
    this.container.x = data.worldPos[0];
    this.container.y = data.worldPos[1];
    this.map.addChildToLayer(this.container, "main");
    this.shape = new createjs.Shape();
    this.sprite = new createjs.Sprite(this.spriteSheet);
    this.sprite.regX = 24.5;
    this.sprite.regY = 21;
    this.sprite.scale = 41 / 49;
    this.container.addChild(this.shape);
    this.container.addChild(this.sprite);
    this.pos = data.pos;
    this.shape.hitArea = this.hitArea;
    this.hitArea.alpha = 0.01;
    this.colors = ['blue'];
    this.shape.addEventListener('click', this.click.bind(this));
    this.shape.addEventListener('mouseover', this.mouseover.bind(this));
    this.shape.addEventListener('mouseout', this.mouseout.bind(this));
    this.draw();
  }

  mouseover() {
    this.hover = true;
    if (this.data.plantData) { //show nickname
      this.textContainer || this.initText();
      this.textContainer.alpha = 1;
    } else {
      this.hitArea.alpha = 0.3;
    }
  }

  mouseout() {
    this.hover = false;
    if (this.textContainer) this.textContainer.alpha = 0;
  }

  initText() {
    this.textContainer = new createjs.Container();
    this.text =
      new createjs.Text(this.data.plantData.owner.display_name, "14px Open sans", hensApp.color[this.data.plantData.owner.village].neuter);
    this.textBg = new createjs.Shape();
    this.textContainer.addChild(this.textBg);
    this.textContainer.addChild(this.text);
    const w = this.text.getMeasuredWidth() + 20;
    const h = 26;
    this.textBg.alpha = .78;
    this.textBg.graphics.f("#111").drawRect(0, 0, w, h);
    this.text.textAlign = "center";
    this.text.textBaseline = "middle";
    this.textBg.set({
      regX: w / 2,
      regY: h / 2
    });
    this.textContainer.x = this.container.x;
    this.textContainer.y = this.container.y + 29;
    this.map.addChildToLayer(this.textContainer, 'ui');
  }

  draw() {
    this.shape.alpha = .5;
    this.shape.graphics.clear();
    this.shape.graphics.beginStroke('#FFF').setStrokeStyle(1).drawPolyStar(0, 0, this.data.radius, 6, 0, 60);
    if (this.data.plantData) {
      this.sprite.alpha = 1;
      if (this.data.plantData.valid) {
        let r = Math.floor(Math.random() * this.colors.length);
        this.sprite.gotoAndPlay(this.colors[r]);
      } else {
        this.sprite.gotoAndStop("planted");
      }
      this.shape.cursor = "auto";
    } else {
      this.shape.cursor = "pointer";
      this.sprite.alpha = 0;
    }
    this.hitArea.graphics.beginFill('#FFF').drawPolyStar(0, 0, this.data.radius, 6, 0, 60);
  }

  update() {
    if (!this.hover && this.hitArea.alpha > 0.01) {
      this.hitArea.alpha = Math.max(0.01, this.hitArea.alpha - 0.015);
    }
  }

  updateData(data) {
    for (let key in data) {
      this.data[key] = data[key];
    }
    this.draw();
  }

  click() {
    this.clickHandle(this);
  }
}

class HexagonalMap {
  constructor(width, height, tileData, canvasId, clickHandle) {
    this.stage = new createjs.Stage(canvasId);
    this.mapWidth = width;
    this.mapHeight = height;
    this.layers = {
      main: new createjs.Container(),
      ui: new createjs.Container()
    };
    this.tileData = tileData;
    Object.keys(this.layers).forEach(key => {
      this.stage.addChild(this.layers[key]);
      this.layers[key].x = this.tileData.radius * 2;
      this.layers[key].y = this.tileData.radius * 2.5;
    });
    this.tiles = [];
    this.stage.canvas.width = 800;
    this.stage.canvas.height = 800 * (9 / 16);
    this.clickHandle = clickHandle;
    this.stage.enableMouseOver(10);
    this.spriteSheet = new createjs.SpriteSheet({
      images: [
        myLocalized.medias + "/events/equinoxe-printemps/graine_plantee.png",
        myLocalized.medias + "/events/equinoxe-printemps/fleur_equinoxe.png"
      ],
      frames: {
        width: 49,
        height: 42
      },
      animations: {
        planted: 0,
        blue: {
          frames: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          next: false,
          speed: 0.15
        }
      }
    });
    this.init();
    this.startTick = this.startTick.bind(this);
    this.startTick();
  }

  addChildToLayer(element, layer) {
    this.layers[layer].addChild(element);
  }

  init() {
    for (let row = 0; row <= this.mapHeight; row++) {
      this.tiles.push([]);
      for (let col = 0; col < this.mapWidth; col++) {
        if (row < this.mapHeight || col % 2 !== 0) {
          let plantedSeed = this.tileData.plantedSeeds.find(plant => plant.x === col && plant.y === row);
          this.tiles[row].push(new HexaTile({
            map: this,
            pos: [col, row],
            spriteSheet: this.spriteSheet,
            plantData: plantedSeed,
            radius: this.tileData.radius,
            worldPos: this.gridToWorld(col, row)
          }, this.clickHandle));
        }
      }
    }
  }

  updateTile(tileData) {
    this.tiles[tileData.y][tileData.x].updateData({
      plantData: tileData
    });
  }

  startTick() {
    this.stage.update();
    this.tiles.forEach(row => {
      row.forEach(tile => tile.update.apply(tile));
    });
    requestAnimationFrame(this.startTick);
  }

  gridToWorld(posX, posY) {
    let w = this.tileData.radius * 2;
    let h = Math.sqrt(3) * this.tileData.radius;
    let even = posX.mod(2) === 0;
    const x = posX * w * 0.75;
    const y = posY * h + (even ? 0 : -1) * (h / 2);
    return [x, y];
  }

}

angular.module('app').controller('WilwarField', [
  '$scope', '$rootScope', 'eventsFactory', '$location', 'storageFactory',
  function ($scope, $rootScope, eventsFactory, $location, storageFactory) {
    $scope.successSound = new Audio('medias/events/equinoxe-printemps/equinoxe_success.mp3');
    $scope.failSound = new Audio('medias/events/equinoxe-printemps/equinoxe_fail.mp3');
    $scope.$parent.info.isAppInit = false;
    $scope.tutorialNeeded = !storageFactory.get('events.printemps.tutorial');
    $scope.updateMissing = () => {
      eventsFactory.equinoxePrintemps.getMissingSeeds().then(data => {
        $scope.missingSeeds = data.data;
      }).catch($rootScope.handleError);
    };

    $scope.closeTutorial = ($event) => {
      if ($event.target.classList.contains('full-page-overlay') ||
        $event.target.classList.contains('full-page-overlay__close')) {
        $scope.tutorialNeeded = false;
        storageFactory.set('events.printemps.tutorial', 'true');
      }
    };

    $scope.onTileClick = (tiledata) => {
      $rootScope.$emit('modal:set', {
        title: 'Planter la graine',
        text: `Souhaitez vous planter une graine à cet endroit là ?`,
        validation: () => {
          eventsFactory.equinoxePrintemps.plantSeed({
            x: tiledata.pos[0],
            y: tiledata.pos[1]
          }).then((plantedSeed) => {
            $scope.plantedSeeds++;
            if (plantedSeed.data.valid) {
              $scope.validSeeds++;
              $scope.successSound.play();
            } else {
              $scope.failSound.play();
            }
            if (!$scope.participants.find(participant => participant.ID === plantedSeed.data.owner.ID)) {
              $scope.participants.push(plantedSeed.data.owner);
            }
            //get the number of seeds user can put down
            eventsFactory.equinoxePrintemps.getMySeeds().then(data => {
              $scope.leftSeeds = data.data;
            }).catch($rootScope.handleError);
            $scope.map.updateTile(plantedSeed.data);
            $scope.updateMissing();
          }).catch($rootScope.handleError);
        }
      });

    };
    eventsFactory.getCurrentEvent().then(data => {
      if (data.data && data.data.slug === "equinoxe-printemps") {
        //get the number of seeds user can put down
        $scope.timeEnd = moment(data.data.end_date).endOf('day').year(moment().get('year'));
        $scope.timeLeftLoop = setInterval(() => {
          let duration = moment.duration(+$scope.timeEnd.toDate() - new Date());
          $scope.timeLeft =
            `${duration.days() > 0 ? `${duration.days()} j,` :
              ''} ${duration.hours()} h, ${duration.minutes()} m, ${duration.seconds()} s`
        }, 1000);
        eventsFactory.equinoxePrintemps.getMySeeds().then(data => {
          $scope.leftSeeds = data.data;
        }).catch($rootScope.handleError);

        // get map data
        eventsFactory.equinoxePrintemps.getCurrentSeeds().then(data => {
          $scope.plantedSeeds = data.data.length;
          $scope.validSeeds = data.data.filter(seed => seed.valid).length;
          $scope.$parent.info.isAppInit = true;
          $scope.participants = [];
          data.data.forEach(plant => {
            if (!$scope.participants.find(participant => participant.ID === plant.owner.ID)) {
              $scope.participants.push(plant.owner);
            }
          });
          $scope.updateMissing();
          $scope.map = new HexagonalMap(24.5, 11, {
            radius: 20,
            plantedSeeds: data.data
          }, 'wilwar-field', $scope.onTileClick);
        }).catch($rootScope.handleError);
      } else {
        $location.path('/map');
      }
    }).catch($rootScope.handleError);
    $scope.$on('$destroy', () => {
      clearInterval($scope.timeLeftLoop);
    });
  }
]);