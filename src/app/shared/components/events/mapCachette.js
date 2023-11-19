angular.module('app').component('mapCachette', {
  templateUrl: myLocalized.partials + 'mapCachette.html',
  controllerAs: 'cacheCtrl',
  bindings: {
    type: '@'
  },
  controller: [
    '$scope', '$element', '$rootScope', '$location', 'cachetteSocket', '$routeParams',
    function ($scope, $element, $rootScope, $location, cachetteSocket, $routeParams) {
      this.map = $scope.$parent;
      this.village = $routeParams.village + ($location.search().quartier ? '-' + $location.search().quartier : '');
      this.sounds = {
        dead: new Audio('/medias/events/carnaval-cachette/sounds/carnaval_dead.mp3'),
        go: new Audio('/medias/events/carnaval-cachette/sounds/carnaval_go.mp3'),
        propHiding: new Audio('/medias/events/carnaval-cachette/sounds/carnaval_prop_alert.mp3'),
        introduction: new Audio('/medias/events/carnaval-cachette/sounds/carnaval_start.mp3'),
      };
      this.player = null;
      this.gameId = !isNaN($location.search().gameId) ? $location.search().gameId : null;
      this.game = {
        hunters: [],
        props: []
      };
      this.killFeed = [];

      this.updateTimeLeft = () => {
        let tl = moment.duration(this.lobby.timeLeft - (+new Date() - this.lobby.timeLocal));
        if (tl.minutes() === 0 && tl.seconds() < 0) {
          cachetteSocket.emit('lobby:load');
        }
        this.lobby.timeLeftFormat = tl.minutes() + 'min ' + tl.seconds() + 'sec';
      };

      //camera position
      this.position = {
        x: 0,
        y: 0
      };
      // saved positition
      this.savedPosition = null;
      //prop player specific
      this.selectedProp = null;
      this.placingProp = false;
      this.initLobby = () => {
        cachetteSocket.connect();
        cachetteSocket.emit('lobby:load');
        cachetteSocket.on('lobby:update', (data) => {
          this.lobby = data;
          this.lobby.timeLocal = +new Date();
          if (!this.timeInterval) this.timeInterval = setInterval(this.updateTimeLeft, 1000);
          this.updateTimeLeft();
        });
      };
      if (!this.gameId || !cachetteSocket.isConnected()) {
        this.initLobby();
      } else {
        cachetteSocket.on('game:update', (data) => {
          if (this.game && this.game.hunters.length > 0) {
            data.hunters.forEach(hunter => {
              hunter.lastPosition =
                this.game.hunters.find(previousHunter => previousHunter.user.ID === hunter.user.ID).position;
            });
            //general game update
            if (this.game.phase !== data.phase) {
              switch (data.phase) {
                case 'introduction':
                  this.sounds.introduction.play();
                  break;
                case 'propHiding':
                  this.sounds.propHiding.play();
                  break;
              }
            } else if (data.phase === 'propHiding' && this.game.timeLeft <= 3100 && this.sounds.go.paused) {
              this.sounds.go.play();
            }
            this.game.phase = data.phase;
            this.game.timeLeft = data.timeLeft;
            this.game.winner = data.winner;
            if (this.game.winner != null) {
              this.gameOver = this.game.winner + '-win';
            }
            let m = Math.floor(data.timeLeft / 60000);
            let s = Math.round(data.timeLeft / 1000) % 60;
            s = s < 10 ? '0' + s : s;
            this.game.timeLeftFormat = m + ":" + s;
            //updates hunters
            this.game.hunters.forEach(hunter => {
              let newHunter = data.hunters.find(h => h.user.ID === hunter.user.ID);
              if (newHunter) {
                hunter.position = newHunter.position;
                hunter.bullets = newHunter.bullets;
              }
              if (hunter.user.ID === this.player.user.ID) {
                this.player = hunter;
              }
            });
          } else {
            this.game.hunters = data.hunters;
          }
          //update props
          if (this.game.props.length > 0) {
            this.game.props.forEach(prop => {
              let newProp = data.props.find(p => p.user.ID === prop.user.ID);
              if (newProp) {
                prop.position = newProp.position;
                prop.alive = newProp.alive;
                if (this.game.phase === 'game' && prop.transformation && prop.transformation !==
                  newProp.transformation) {
                  prop.transforming = +new Date();
                } else if (prop.transforming && +new Date() - prop.transforming > 5000) {
                  prop.transforming = false;
                }
                prop.transformation = newProp.transformation;
                prop.transformationData = newProp.transformationData;
              }
              if (prop.user.ID === this.player.user.ID) {
                this.player = prop;
              }
            });
          } else {
            this.game.props = data.props;
          }
          if (this.game.phase === 'game' && this.player.type === 'prop') {
            this.map.mapState.disabled = true;
          }
          setTimeout(() => {
            //set position for hunter looks
            this.game.hunters.forEach(hunter => {
              let element = $element.find('#hunter-' + hunter.user.ID);
              if (element[0]) {
                element[0].style.left = (hunter.position.x) + 'px';
                element[0].style.top = (hunter.position.y) + 'px';
              }
            });
            //set position for props
            this.game.props.forEach(prop => {
              let element = $element.find('#prop-' + prop.user.ID);
              if (element[0]) {
                element[0].style.left = prop.position.x + 'px';
                element[0].style.top = prop.position.y + 'px';
              }
            });
          }, 0);
        });

        cachetteSocket.on('game:kill', (data) => {
          data.created = +new Date();
          setTimeout(() => {
            data.visible = true;
          }, 0);
          this.killFeed.push(data);
          setTimeout(() => { data.visible = false }, 10000);
        });
        cachetteSocket.emit('game:me');
        cachetteSocket.on('game:me', (data) => {
          this.player = data;
          if (!$('#navBar').hasClass('hidden')) {
            $('#navBar').addClass('hidden');
          }
          if (this.player.type === 'hunter') {
            this.initHunterInterval();
          }
          if (this.player.type === 'prop') {
            this.initPropEvents();
          }
        });
      }

      this.updatePosition = () => {
        this.position = this.map.getMapPos();
        this.position.x += window.innerWidth / 2 - 75;
        this.position.y += window.innerHeight / 2 - 75;
      };

      this.sendPosition = () => {
        this.savedPosition = this.position;
        console.log(this.savedPosition, this.position);
        cachetteSocket.emit('hunters:update', this.position);
      };

      this.clickZoneHunter = (event) => {
        cachetteSocket.emit('hunters:action', {
          position: {
            x: event.pageX + this.map.getMapPos().x,
            y: event.pageY + this.map.getMapPos().y - 80
          }
        });
      };

      this.initHunterInterval = () => {
        this.map.mapState.disabled = true;
        this.map.mapState.obfuscated = true;
        //disable minimap for hunters
        // cachetteSocket.on('hunters:kill', (data) => {
        //   $rootScope.setAlert('success', "Bravo! Vous avez trouvé " + data.display_name + " qui était déguisé en " +
        //     data.transformationData.name + " !");
        // });
        cachetteSocket.on('hunters:death', (data) => {
          this.sounds.dead.play();
          this.gameOver = 'hunter-death';
        });
        cachetteSocket.emit('props:list');
        cachetteSocket.on('props:list', (data) => {
          this.oppPropTransformations = data.filter(prop => !prop.secret);
        });
        this.updateInterval = setInterval(() => {
          this.invalidRatio = window.devicePixelRatio < 1;
          if (this.player.type === 'hunter') {
            this.updatePosition();
            if (!this.savedPosition || this.savedPosition.x !== this.position.x || this.savedPosition.y !==
              this.position.y) {
              this.sendPosition();
            }
          }
          //TODO: hidden for now, because it helps too much
          if (document.querySelector('.map-cachette__hunter-aiming')) {
            let minDistance = this.game.props.filter(prop => prop.alive).reduce((acc, prop) => {
              var a = -this.map.mapOffset.x + window.innerWidth / 2 - prop.position.x;
              var b = -this.map.mapOffset.y + window.innerHeight / 2 - prop.position.y;
              let distance = Math.sqrt(a * a + b * b);
              if (distance < acc) return distance; else return acc;
            }, 100000);
            document.querySelector('.map-cachette__hunter-aiming').style.opacity =
              Math.min(0.149, Math.max(0, ((1600 - minDistance) / 1600)) / 2);
          }

        }, 1000 / 5);
      };

      this.initPropEvents = () => {
        this.updateInterval = setInterval(() => {
          this.invalidRatio = window.devicePixelRatio < 1;
          if (document.querySelector('.map-cachette__prop-hue')) {
            let myProp = this.game.props.find(prop => this.player.user.ID === prop.user.ID);
            this.map.mapOffset.x = -(myProp.position.x - window.innerWidth / 2);
            this.map.mapOffset.y = -(myProp.position.y - window.innerHeight / 2);
            let minDistance = this.game.hunters.reduce((acc, hunter) => {
              var a = myProp.position.x - hunter.position.x;
              var b = myProp.position.y - hunter.position.y;
              let distance = Math.sqrt(a * a + b * b);
              if (distance < acc) return distance; else return acc;
            }, 100000);
            document.querySelector('.map-cachette__prop-hue').style.opacity =
              Math.min(0.17, Math.max(0, ((1000 - minDistance) / 1000)) / 4);
          }
        }, 1000 / 10);
        cachetteSocket.emit('props:list');
        cachetteSocket.on('props:list', (data) => {
          this.propTransformations = data;
          this.changeProp(1);
        });

        cachetteSocket.on('props:death', () => {
          this.sounds.dead.play();
          this.gameOver = 'prop-death';
        });
      };

      this.transform = (event) => {
        this.placingProp = false;
        let mapPos = this.map.getMapPos();
        this.propTransformations.forEach(prop => prop.selected = false);
        cachetteSocket.emit('props:action', {
          actionType: 'transform',
          data: {
            x: event.pageX + mapPos.x,
            y: event.pageY + mapPos.y - 80,
            transformation: this.selectedProp
          }
        });
        this.selectedProp = null;
      };

      this.choosePropIndex = 0;

      this.changeProp = (offset) => {
        this.choosePropIndex += offset;
        if (this.choosePropIndex >= this.propTransformations.length) {
          this.choosePropIndex = 0;
        } else if (this.choosePropIndex < 0) {
          this.choosePropIndex = this.propTransformations.length - 1;
        }
        this.chosenProp = this.propTransformations[this.choosePropIndex];
        if (this.choosePropIndex - 1 < 0) {
          this.previousProp = this.propTransformations[this.propTransformations.length - 1];
        } else {
          this.previousProp = this.propTransformations[this.choosePropIndex - 1];
        }
        if (this.choosePropIndex + 1 >= this.propTransformations.length) {
          this.nextProp = this.propTransformations[0];
        } else {
          this.nextProp = this.propTransformations[this.choosePropIndex + 1];
        }
      };

      this.selectProp = (prop) => {
        if (this.game.phase === 'propHiding') {
          this.propTransformations.forEach(prop => prop.selected = false);
          prop.selected = true;
          if (this.game.phase === 'propHiding') {
            this.placingProp = true;
          }
          this.selectedProp = prop;
        } else {
          cachetteSocket.emit('props:action', {
            actionType: 'transform',
            data: {
              transformation: prop
            }
          });
        }
      };

      this.moveInvisibleProp = (event) => {
        let invisProp = $element.find('.invisible-prop');
        if (invisProp[0]) {
          invisProp[0].style.left = event.pageX - this.selectedProp.width / 2 + 'px';
          invisProp[0].style.top = event.pageY - this.selectedProp.height / 2 + 'px';
        }
      };

      this.$onDestroy = () => {
        clearInterval(this.updateInterval);
        cachetteSocket.removeAllListeners();
      }
    }
  ]
});