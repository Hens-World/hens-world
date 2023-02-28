class Layer {
  constructor(data, stage, sprites, handlers) {
    this.data = data;
    this.handlers = handlers;
    this.stage = stage;
    this.sprites = sprites;
    this.group = new createjs.Container();
    this.setSize();
    this.stage.addChild(this.group);
    this.interactive = data.name.indexOf("object_clic") === 0;
    if (this.interactive) {
      this.stage.enableMouseOver();
    }
    this.init();
  }

  setSize() {
    this.group.set({
      x: window.innerWidth / 1.9,
      y: 100,
    });
  }

  init() {
    this.tiles = this.data.decodedData.map((tileId, index) => {
      if (tileId !== 0) {
        let spriteData = this.sprites.find(sprite => sprite.gid === tileId);
        let tile = new Tile(spriteData, this.group);
        if (this.interactive) {
          let action = this.data.properties.find(property => property.name === 'action').value;
          tile.sprite.addEventListener("mouseover", (event) => {
            var matrix = new createjs.ColorMatrix().adjustBrightness(30);
            tile.sprite.filters = [
              new createjs.ColorMatrixFilter(matrix)
            ];
            event.target.cursor = "pointer";
            tile.updateCache();
          });
          tile.sprite.addEventListener("mouseout", (event) => {
            var matrix = new createjs.ColorMatrix().adjustBrightness(0);
            tile.sprite.filters = [
              new createjs.ColorMatrixFilter(matrix)
            ];
            tile.updateCache();
          });
          tile.sprite.addEventListener('click', (event) => {
            this.handlers(action);
          });
        }
        let mapPosX = index % this.data.width;
        let mapPosY = Math.floor(index / this.data.width);
        let worldPos = this.gridToWorld(mapPosX, mapPosY);

        tile.setPos(worldPos[0], worldPos[1]);
        return tile;
      } else {
        return null;
      }
    });
  }

  gridToWorld(posX, posY) {
    const x = (((posX * this.data.tilewidth) / 2)) - ((posY * this.data.tilewidth) / 2);
    const y = ((posX * this.data.tileheight) / 2) + ((posY * this.data.tileheight) / 2);
    return [x, y];
  }
}

class Tile {
  constructor(spriteData, stage) {
    this.spriteData = spriteData;
    this.stage = stage;
    this.text = new createjs.Text("placeholder", "12px Arial", "#2CC");
    this.init();
  }

  updateCache() {
    this.sprite.cache(-this.spriteData.spritesheet._frameWidth, -this.spriteData.spritesheet._frameHeight, this.spriteData.spritesheet._frameWidth *
      2, this.spriteData.spritesheet._frameHeight * 2);

  }

  init() {
    this.sprite = new createjs.Sprite(this.spriteData.spritesheet);
    this.sprite.gotoAndStop(this.spriteData.index);
    this.stage.addChild(this.sprite);
  }

  setPos(x, y) {
    this.sprite.set({
      x: x,
      y: y
    });
    this.text.set({
      text: x + " " + y,
      x: x,
      y: y
    });
  }
}

class IsometricMap {
  constructor(data, canvasID, tilePath, handlers) {
    this.data = data;
    this.tilePath = tilePath;
    this.handlers = handlers;
    this.stage = new createjs.Stage(canvasID);
    this.stage.canvas.width = window.innerWidth;
    this.stage.canvas.height = window.innerHeight - 85;

    this.init();
    this.startTick = this.startTick.bind(this);
    this.startTick();
  }

  init() {
    this.createSpriteList();
    this.layers = this.data.layers.map(layerData => {
      layerData.tilewidth = this.data.tilewidth;
      layerData.tileheight = this.data.tileheight;
      let layer = new Layer(layerData, this.stage, this.sprites, this.handlers);
      return layer;
    });
    window.addEventListener('resize', () => {
      this.layers.forEach(layer => {
        layer.setSize();
      })
    });
  }

  startTick() {
    this.stage.update();
    requestAnimationFrame(this.startTick);
  }

  createSpriteList() {
    // [].concat.apply applatit une liste d'arrays en un seul array
    this.sprites = [].concat.apply([], this.data.tilesets.map(spritesheet => {
      let spritesDatas = [];
      let ss = new createjs.SpriteSheet({
        images: [this.tilePath + spritesheet.image],
        frames: {
          spacing: spritesheet.spacing,
          margin: spritesheet.margin,
          regX: 32,
          regY: spritesheet.tileheight - 16,
          width: spritesheet.tilewidth,
          height: spritesheet.tileheight
        }
      });
      for (let i = 0; i < spritesheet.tilecount; i++) {
        let spriteData = {
          spritesheet: ss,
          gid: spritesheet.firstgid + i,
          index: i,
          x: (spritesheet.tilewidth * i) % spritesheet.imagewidth,
          y: Math.floor((spritesheet.tilewidth * i) / spritesheet.imagewidth) * spritesheet.tileheight,
        };
        spritesDatas.push(spriteData);
      }
      return spritesDatas;
    }));
  }
}

angular.module('app').controller('MapInterior', [
  '$scope', '$rootScope', 'eventsFactory', 'localeFactory', '$routeParams', '$location',
  function ($scope, $rootScope, eventsFactory, localeFactory, $routeParams, $location) {
    $scope.$parent.info.isAppInit = false;
    localeFactory.mediasJSON(`map/${$routeParams.village}/${$routeParams.zone}/interiors/${$routeParams.location}/map_data`).then(data => {
      $scope.mapData = data.data;
      $scope.mapData.name = `interior_${$routeParams.location}`;
      $scope.layers = [];
      $scope.tileSets = [];
      var Base64Decode = function (data) {
        var binaryString = atob(data);
        var len = binaryString.length;
        var bytes = new Array(len / 4);

        // Interpret binaryString as an array of bytes representing little-endian encoded uint32 values.
        for (var i = 0; i < len; i += 4) {
          bytes[i / 4] =
            (binaryString.charCodeAt(i) | binaryString.charCodeAt(i + 1) << 8 | binaryString.charCodeAt(i + 2) << 16 |
              binaryString.charCodeAt(i + 3) << 24) >>> 0;
        }

        return bytes;
      };
      $scope.mapData.layers = $scope.mapData.layers.map(layer => {
        let decoded = [];
        layer.decodedData = Base64Decode(layer.data);
        return layer;
      });
      $scope.map =
        new IsometricMap($scope.mapData, "temple", myLocalized.medias +
          `map/${$routeParams.village}/${$routeParams.zone}/interiors/${$routeParams.location}/`, $scope.clickHandlers);
    });

    $scope.clickHandlers = (action) => {
      switch (action) {
        case "prier_wilwar":
        case "priere_anar":
        case "priere_sulimo":
        case "priere_ulmo":
          eventsFactory.pray(action.split("_")[1]).then(data => {
            $rootScope.setAlert('success', `Vous avez obtenu le rang ${data.data.rank}`)
          }).catch($rootScope.handleError);
          break;
        case "leave":
          $location.path(`/map/${$routeParams.village}/${$routeParams.zone}/${$routeParams.location}`);
          break;
      }
    };
    $scope.$parent.info.isAppInit = true;
  }
]);