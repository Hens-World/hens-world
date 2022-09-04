angular.module('app').component('fireworks', {
  templateUrl: myLocalized.partials + 'fireworks.html',
  controllerAs: 'fwCtrl',
  bindings: {
    village: '<'
  },
  controller: [
    '$scope', '$element', '$rootScope', 'fireworkSocket', function ($scope, $element, $rootScope, fireworkSocket) {
      this.patterns = ['bloom', 'cluster', 'shotgun'];
      this.shapes = ['square', 'triangle', 'circle'];
      this.counter = 5;
      this.maxCounter = 5;
      this.colors = {
        bloom: [
          [
            [232, 132, 0], [37, 234, 176]
          ], [
            [17, 171, 166], [255, 219, 95]
          ], [
            [159, 167, 10], [255, 209, 49]
          ], [
            [227, 55, 13], [255, 192, 232]
          ], [
            [255, 252, 196], [176, 231, 29]
          ], [
            [247, 128, 255], [29, 231, 176]
          ], [
            [235, 251, 255], [162, 231, 29]
          ], [
            [128, 255, 245], [17, 206, 97]
          ], [
            [155, 255, 128], [243, 19, 114]
          ]
        ],
        cluster: [
          [232, 132, 0], [17, 171, 166], [159, 167, 10], [227, 55, 13], [255, 252, 196], [247, 128, 255],
          [235, 251, 255], [128, 255, 245], [155, 255, 128]
        ],
        shotgun: [
          [232, 132, 0], [17, 171, 166], [159, 167, 10], [227, 55, 13], [255, 252, 196], [247, 128, 255],
          [235, 251, 255], [128, 255, 245], [155, 255, 128]
        ]
      };

      this.currentOptions = {
        pattern: this.patterns[1],
        shape: this.shapes[1],
        colors: this.colors[this.patterns[1]][0]
      };
      this.controls = {
        activated: false,
        pattern: false,
        shape: false,
        colors: false
      };
      this.$onInit = () => {
        var head = document.getElementsByTagName('head')[0];
        var imported = document.createElement('script');
        imported.type = "text/javascript";
        imported.src = '/js/fireworks.js';
        imported.onload = () => {
          this.fireworkManager = new window.FireworkManager();
          this.fireworkManager.init($element[0]);
          this.fireworks = this.fireworkManager.getCurrentPage();
        };
        head.appendChild(imported);
      };

      this.$onDestroy = () => {
        clearInterval(this.timerUpdate);
      };

      this.delta = 0;
      this.previousDate = +new Date();
      this.timerUpdate = setInterval(() => {
        this.delta = +new Date() - this.previousDate;
        this.previousDate = +new Date();
        if (this.counter + this.delta / 8000 <= this.maxCounter) {
          this.counter += this.delta / 8000;
        } else {
          this.counter = this.maxCounter;
        }
      }, 100);

      this.getCounters = () => {
        let c = this.counter;
        var arr = [];
        for (let i = 0; i < 5; i++) {
          c--;
          if (c > 0) {
            arr.push(1);
          } else {
            arr.push(Math.max(c + 1, 0));
          }
        }
        return arr;
      };
      this.toggleLaunch = () => {
        this.controls.activated = true;
      };
      this.launchFirework = () => {
        Object.keys(this.controls).forEach(key => {
          this.controls[key] = false;
        });
        if (this.counter >= 1) {
          this.currentOptions.village = this.village;
          this.fireworks.launchFirework(this.currentOptions);
          fireworkSocket.emit('launchFirework', this.currentOptions);
          this.counter--;
          console.log(this.counter);
        } else {
          $rootScope.setAlert('error', "Vous n'avez pas de feu d'artifice prêt au lancement! Attendez quelques secondes :)");
        }
      };
      this.selectParam = (tag, value) => {
        this.currentOptions[tag] = value;
        this.controls[tag] = false;
        if (tag === 'pattern') {
          this.currentOptions.colors = this.colors[value][0];
        }
      };
      this.showParam = (tag) => {
        Object.keys(this.controls).forEach(key => {
          if (key !== tag) this.controls[key] = false;
        });
        this.controls[tag] = !this.controls[tag];
      };

      this.getSpinnerStyle = (value) => {
        return `transform:rotate(${value * 360}deg);`;
      };

      this.socketInit = () => {
        fireworkSocket.connect();
        fireworkSocket.on('receiveFirework', (data) => {
          if (data.village == this.village) {
            this.fireworks.launchFirework(data);
          }
        });
      };

      if ($rootScope.socketConnected) {
        this.socketInit();
      } else {
        let w = $rootScope.$watch('socketConnected', (n, o) => {
          if (n && n !== o) {
            this.socketInit();
            w();
          }
        });
      }
    }
  ]
});