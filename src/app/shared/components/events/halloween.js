angular.module('app').component('halloween', {
  templateUrl: myLocalized.partials + 'halloween.html',
  controllerAs: 'hallCtrl',
  bindings: {},
  controller: [
    '$scope', '$element', '$rootScope', 'eventsFactory', function ($scope, $element, $rootScope, eventsFactory) {
      this.timerInterval = null;
      this.notificationList = [];
      this.loadedScreener = false;
      this.map = $scope.$parent;
      this.onScreenLoad = null;
      this.displayInfos = false;

      $scope.$on('halloween_complete', (event, data) => {
        this.scoring = data;
        // this.scoring.yourScore.score += 5000;
        this.scoring.bestScore.formattedValue = hensApp.formatTime(this.scoring.bestScore.score, "mm unit ss unit");
        this.scoring.yourScore.formattedValue = hensApp.formatTime(this.scoring.yourScore.score, "mm unit ss unit");
      });

      $scope.$on('halloween_feed', (event, data) => {
        if (data.left != null || this.displayInfos) {
          eventsFactory.halloweenPumpkins.getLeft(this.map.village, this.map.zone, this.map.district).then((data)=>{
            this.leftInVillage = data.data;
            if(this.leftInVillage === 0) {
              this.leftInVillage = null;
            }
          });
          if (data.left === 15) {
            this.launchFirstGlitch();
          } else if (data.left === 4) {
            setTimeout(()=>{
              this.launchSecondGlitch();
            }, 100);
          }
          this.notificationList.push(data);
          setTimeout(() => {
            data.visible = true;
          });
          setTimeout(() => {
            data.visible = false;
          }, 8000);
        }
      });

      this.launchFirstGlitch = () => {
        let glitchElement = document.querySelector('.glitch');
        glitchElement.classList.add('first-animation');
        setTimeout(() => {
          glitchElement.classList.remove('first-animation');
        }, 4000);
      };

      this.launchSecondGlitch = () => {
        let glitchElement = document.querySelector('.glitch');
        glitchElement.classList.add('second-animation');
        setTimeout(() => {
          glitchElement.classList.remove('second-animation');
        }, 5000);
      };

      this.$onInit = () => {

        this.mappedZone = hensApp.zoneNames[this.map.zone === 'village' ? this.map.village : this.map.zone];
        var head = document.getElementsByTagName('head')[0];
        var imported = document.createElement('script');
        imported.type = "text/javascript";
        imported.src = '/js/externals/html2canvas.js';
        imported.onload = () => {
          this.loadedScreener = true;
          if (this.onScreenLoad) {
            this.onScreenLoad();
          }
        };
        head.appendChild(imported);
        eventsFactory.halloweenPumpkins.getFirst().then((data) => {
          let pumpkin = data.data;

          if (pumpkin) {
            this.displayInfos = pumpkin.village === "hasInfos";
            if(pumpkin === -1) {//race already finished
              this.startingHunt = false;
            } else {
              this.firstPumpkin = pumpkin;
              this.startingHunt = false;
              this.startedAt = +new Date();
              this.startTimerUpdate();
            }
          } else {
            this.startingHunt = true;
            $scope.$parent.mapState.fixed = true;
            $scope.$parent.mapState.disabled = true;
          }
        }).catch($rootScope.handleError);
      };

      this.startTimerUpdate = () => {
        eventsFactory.halloweenPumpkins.getLeft(this.map.village, this.map.zone, this.map.district).then((data)=>{
          this.leftInVillage = data.data;
          if(this.leftInVillage === 0) {
            this.leftInVillage = null;
          }
        });
        this.getTime();
        setInterval(() => {
          this.getTime();
        }, 1000);
      };

      this.getTime = () => {
        let time = (+new Date() - this.startedAt) + this.firstPumpkin.timer;
        this.formattedTimer = hensApp.formatTime(time, "mm:ss");
      };

      this.startHunt = (displayInfos) => {
        eventsFactory.halloweenPumpkins.create("pumpkin_start", this.displayInfos ? 'hasInfos' : 'noInfos', 'fake').then((d) => {
          $scope.$parent.mapState.fixed = false;
          $scope.$parent.mapState.disabled = false;
          this.firstPumpkin = d.data;
          this.firstPumpkin.timer = 0;
          this.formattedTimer = 0;
          this.startedAt = +new Date();
          this.startingHunt = false;
          this.startTimerUpdate();
        }).catch($rootScope.handleError);
      };

      this.$onDestroy = () => {
        clearInterval(this.timerInterval);
      };

      this.closeScore = () => {
        this.scoring = null;
        this.firstPumpkin = null;
      }
    }
  ]
});