angular.module('app').component('playControl', {
  templateUrl: myLocalized.partials + 'playControl.html',
  bindings: {
    musicBound: "<",
    mode: '@'
  },
  controllerAs: 'playCtrl',
  controller: ['$scope', '$rootScope', 'musicPlayerFactory', function ($scope, $rootScope, musicPlayerFactory) {
    this.$onInit = () => {
      this.setState = bool => {
        this.playState = bool ? 'playing' : 'paused';
      };
      this.setState(musicPlayerFactory.isPlaying());

      this.playStateUpdatedHandler = $scope.$on('play-state-updated', (event, data) => {
        if (!this.musicBound || this.musicBound === data.slug) {
          this.setState(data.state);
        }
      });

      this.songChangedHandler = $scope.$on('song-changed', (event, data) => {
        if (this.musicBound && this.musicBound !== data.slug) {
          this.setState(false);
        }
        else if (data.isPlaying) {
          this.setState(true);
        }
      });
      this.togglePlay = () => {
        if (!!this.musicBound) {
          $scope.$emit('togglePlay', this.musicBound);
        }
        else {
          $scope.$emit('togglePlay');
        }
      };
    };

    this.$onDestroy = () => {
      this.playStateUpdatedHandler();
      this.songChangedHandler();
    }
  }]
});
