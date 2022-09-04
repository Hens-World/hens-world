/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
angular.module('app').component('volumeControl', {
  templateUrl: myLocalized.partials + 'volumeControl.html',
  controllerAs: 'volCtrl',
  controller: ['$scope', '$element', function ($scope, $element) {
    this.isBarVisible = false; // only effective when orientation is vertical

    this.$onInit = () => {
      // set default value for orientation at vertical
      if (!this.orientation) this.orientation = "vertical";
      this.icon = $element.find('.volume-control__icon');
      this.bar = $element.find('.volume-control__bar');
      this.percent = 100;
      this.barFill = $element.find('.volume-control__fill');
      if (this.orientation === 'vertical') {
        this.icon.click((e) => {
          this.toggleBarVisibility();
        });
      }

      this.toggleBarVisibility = () => {
        this.isBarVisible = !this.isBarVisible;
      };

      this.updateVolume = (percent) => {
        this.percent = Math.round(percent * 100) !== this.percent ? Math.round(percent * 100) : this.percent;
      };

      this.onVolumeEvent = (e) => {
        let percent = 0;
        if (this.orientation === 'horizontal') {
          const maxWidth = this.bar.width();
          const mouseX = e.pageX;
          const startX = this.bar.offset().left;
          const relDistance = Math.min(maxWidth, Math.max(0, mouseX - startX));
          percent = relDistance / maxWidth;
        }
        else if (this.orientation === 'vertical') {
          const maxHeight = this.bar.height();
          const mouseY = e.pageY;
          const startY = this.bar.offset().top + this.bar.height();
          const relDistance = Math.min(maxHeight, Math.max(0, startY - mouseY));
          percent = relDistance / maxHeight;
        }
        $scope.$emit('volume-update', percent);
        this.updateVolume(percent);
      };

      // event handlers DOM
      this.bar.mousedown((e) => {
        this.isVolumeMoving = true;
        this.onVolumeEvent(e);
      });

      $element.mousemove((e) => {
        if (this.isVolumeMoving) {
          this.onVolumeEvent(e);
        }
      });

      this.clearVolumeDisplay = (e) => {

        if (this.isBarVisible &&
          (!e.target.classList.contains('volume-control__bar')
          && !e.target.classList.contains('volume-control__fill'))) {
          this.toggleBarVisibility();
        }
      };
      $(document).mousedown(this.clearVolumeDisplay);

      this.mouseUp = (e) => {
        this.isVolumeMoving = false;
      };
      $(document).mouseup(this.mouseUp);

      //event emitter handler
      this.volumeUpdatedHandler = $scope.$on('volume-updated', (e, data) => {
        this.updateVolume(data);
      });

      $scope.$emit('volume-update');

      this.$onDestroy = () => {
        this.volumeUpdatedHandler();
        $(document).off('mouseout', this.mouseUp);
        $(document).off('mouseup', this.clearVolumeDisplay)
      }
    }
  }],
  bindings: {
    orientation: '@'
  }
});