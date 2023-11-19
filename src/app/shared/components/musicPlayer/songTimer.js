angular.module('app').component('songTimer', {
  templateUrl: myLocalized.partials + 'songTimer.html',
  bindings: {
    musicBound: "<"
  },
  controllerAs: 'timerCtrl',
  controller: ['$scope', '$rootScope', '$element', function ($scope, $rootScope, $element) {
    this.onBarEvent = (e) => {
      let percent = 0;
      const maxWidth = this.bar.width();
      const mouseX = e.pageX;
      const startX = this.bar.offset().left;
      const relDistance = Math.min(maxWidth, Math.max(0, mouseX - startX));
      percent = relDistance / maxWidth;
      $scope.$emit('timer-update', { percent: percent, musicBound: this.musicBound });
    };

    this.$onInit = () => {
      this.bar = $element.find('.song-timer');
      this.barFill = $element.find('.song-timer__fill');
      this.timerUpdateEvent = $scope.$on('timer-updated', (event, data) => {
        $scope.safeApply(() => {
          if (data) {
            if (!this.musicBound || data.slug === this.musicBound) {
              this.percent = data.percent * 100;
            }
            else {
              this.percent = 0;
            }
          }
        });
      });

      this.bar.mousedown((e) => {
        this.isMovingTime = true;
        $scope.$emit('timer-update-start', { slug: this.musicBound });
        this.onBarEvent(e);
      });

      this.mouseMove = (e) => {
        if (this.isMovingTime) {
          this.onBarEvent(e);
        }
      };
      $(document).mousemove(this.mouseMove);

      this.mouseUp = (e) => {
        $scope.$emit('timer-update-stop', { slug: this.musicBound });
        this.isMovingTime = false;
      };
      $(document).mouseup(this.mouseUp);

    };

    this.$onDestroy = () => {
      this.timerUpdateEvent();
      $(document).off('mouseup', this.mouseUp);
      $(document).off('mousemove', this.mouseMove);
    };

    $scope.safeApply = function (fn) {
      var phase = this.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn && (typeof (fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
  }]
});
