/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('musiqueArticle', ['userFactory', '$rootScope', (userFactory, $rootScope) =>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'musiqueArticle.html',
    scope: {
      post: '=',
      user: '=',
      isFav: '=',
      playlist: '='
    },
    controller($scope, $element) {
      $scope.songInfo = {seconds: 0, minutes: 0};
      $scope.$parent.info.isAppInit = true;

      $scope.previousSong = () => $scope.$emit('previousSong');

      $scope.nextSong = () => $scope.$emit('nextSong');


      $scope.toggleShuffleDisplay = () => $scope.$emit('toggleShuffleDisplay');

      $scope.toggleRepeatDisplay = () => $scope.$emit('toggleRepeatDisplay');

      $scope.isPlaying = "pause";

      $rootScope.$watch('isPlaying', function (n, o) {
        if (n !== o) {
          return $scope.isPlaying = n;
        }
      });

      $rootScope.$watchCollection('playerControls', function (n, o) {
        if (n !== o) {
          return $scope.playerControls = n;
        }
      });


      $rootScope.$watchCollection('song', function (n, o) {
        $scope.currentSongIndex = n;
        if (n !== o) {
          return $scope.currentSongIndex = n;
        }
      });
      $scope.playerControls = {repeat: false};


      $rootScope.$watch('percent', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.percent = newValue;
          $scope.duration = $rootScope.duration;
          return $scope.updateTimer();
        }
      });

      $scope.updateTimer = function () {
        const maxWidth = $('.song-timer-container').width() * 0.9;
        $element.find('.song-timer-fill').css('width', `${$scope.percent * maxWidth}px`);
        $element.find('.song-timer-handle').css('margin-left', `${($scope.percent * maxWidth) - 5}px`);
        $scope.songInfo.minutes = Math.floor(($scope.duration * $scope.percent) / 60);
        $scope.songInfo.seconds = Math.floor(($scope.duration * $scope.percent) % 60);
        $scope.timeLeft = $scope.duration - ($scope.duration * $scope.percent);
        $scope.leftMinutes = Math.floor(($scope.timeLeft - 0.5) / 60);
        $scope.leftSeconds = Math.floor(($scope.timeLeft - 0.5) % 60);
        if ($scope.leftSeconds < 10) {
          $scope.leftSeconds = `0${$scope.leftSeconds}`;
        }
        if (isNaN($scope.leftMinutes) || isNaN($scope.leftSeconds)) {
          $scope.timeLeft = "0:00";
        } else {
          $scope.timeLeft = `${$scope.leftMinutes}:${$scope.leftSeconds}`;
        }
        if ($scope.songInfo.seconds < 10) {
          $scope.songInfo.seconds = `0${$scope.songInfo.seconds}`;
        }
        return $scope.timeDone = `${$scope.songInfo.minutes}:${$scope.songInfo.seconds}`;
      };

      if (($scope.post.miniature.indexOf('/common/musique.png') >= 0) || ($scope.post.miniature === null)) {
        $scope.backgroundImage = myLocalized.medias + `map/${$scope.post.village.slug}/${$scope.post.village.slug}_overview.jpg`;
        return $scope.noBlur = true;
      } else {
        return $scope.backgroundImage = $scope.post.miniature;
      }
    }
  })

]);
