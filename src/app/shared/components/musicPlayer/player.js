/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('hensPlayer', ['$compile', 'postFactory', 'userFactory', '$rootScope', 'musicPlayerFactory', ($compile, postFactory, userFactory, $rootScope, musicPlayerFactory) =>
({
  restrict: 'A',
  templateUrl: myLocalized.partials + 'player.html',
  scope: {
    user: '=',
    ready: '='
  },
  controller($scope, $element) {
    $scope.showPlaylist = () => $scope.displayPlaylist = !$scope.displayPlaylist;

    //                                                    ,,
    //    mm       MMP""MM""YMM                         `7MM
    //    MM       P'   MM   `7                           MM
    //  mmMMmm ,pW"Wq.  MM  ,pW"Wq.   .P"Ybmmm  .P"Ybmmm  MM  .gP"Ya
    //    MM  6W'   `Wb MM 6W'   `Wb :MI  I8   :MI  I8    MM ,M'   Yb
    //    MM  8M     M8 MM 8M     M8  WmmmP"    WmmmP"    MM 8M""""""
    //    MM  YA.   ,A9 MM YA.   ,A9 8M        8M         MM YM.    ,
    //    `Mbmo`Ybmd9'.JMML.`Ybmd9'   YMMMMMb   YMMMMMb .JMML.`Mbmmd'
    //                               6'     dP 6'     dP
    //                               Ybmmmd'   Ybmmmd'

    $scope.$on('player-controls-updated', function (event, data) {
      $scope.playerControls = data;
    });

    $rootScope.$on('timer-update', function (event, data) {
      if (!data.musicBound || data.musicBound === musicPlayerFactory.getCurrentSong().slug) {
        musicPlayerFactory.setCurrentTime(data.percent * musicPlayerFactory.getDuration());
      }
    });

    $rootScope.$on('timer-update-start', function (event, data) {
      if (!data.musicBound || data.musicBound === $scope.getCurrentSong().slug) {
        if ($scope.isPlaying) {
          $scope.togglePlay();
          $scope.timerPaused = true;
        }
      }
    });

    $rootScope.$on('timer-update-stop', function (event, data) {
      if (!data.musicBound || data.musicBound === $scope.getCurrentSong().slug) {
        if ($scope.timerPaused && !$scope.isPlaying) {
          $scope.togglePlay();
          $scope.timerPaused = false;
        }
      }
    });


    $scope.$on('song-info-updated', (event, data) => {
      $scope.songInfo = data;
    });

    $scope.$on('song-changed', (event, data) => {
      $scope.currentSongArt = musicPlayerFactory.getCurrentSong();
    });

    //                                         ,,
    //  MMP""MM""YMM                         `7MM
    //  P'   MM   `7                           MM
    //       MM  ,pW"Wq.   .P"Ybmmm  .P"Ybmmm  MM  .gP"Ya
    //       MM 6W'   `Wb :MI  I8   :MI  I8    MM ,M'   Yb
    //       MM 8M     M8  WmmmP"    WmmmP"    MM 8M""""""
    //       MM YA.   ,A9 8M        8M         MM YM.    ,
    //     .JMML.`Ybmd9'   YMMMMMb   YMMMMMb .JMML.`Mbmmd'
    //                    6'     dP 6'     dP
    //                    Ybmmmd'   Ybmmmd'

    $scope.toggleShuffleDisplay = function () {
      musicPlayerFactory.toggleShuffle();
    };

    $scope.toggleRepeatDisplay = function () {
      musicPlayerFactory.toggleRepeat();
    };

    $scope.togglePlay = function () {
      musicPlayerFactory.togglePlay();
    };

    //             ,,                    ,,    ,,
    //           `7MM                  `7MM    db            mm
    //             MM                    MM                  MM
    //  `7MMpdMAo. MM   ,6"Yb.`7M'   `MF'MM  `7MM  ,pP"Ybd mmMMmm
    //    MM   `Wb MM  8)   MM  VA   ,V  MM    MM  8I   `"   MM
    //    MM    M8 MM   ,pm9MM   VA ,V   MM    MM  `YMMMa.   MM
    //    MM   ,AP MM  8M   MM    VVV    MM    MM  L.   I8   MM
    //    MMbmmd'.JMML.`Moo9^Yo.  ,V   .JMML..JMML.M9mmmP'   `Mbmo
    //    MM                     ,V
    //  .JMML.                OOb"

    $scope.nextSong = function () {
      musicPlayerFactory.nextSong();
    };

    $scope.previousSong = function () {
      musicPlayerFactory.previousSong();
    };

    $scope.updateTimer = function () {
      const maxWidth = $element.find('.song-timer').width();
      const time = musicPlayerFactory.getCurrentTime();
      const duration = musicPlayerFactory.getDuration();
      $rootScope.duration = duration;
      const per = time / duration;
      $rootScope.$broadcast('timer-updated', {
        percent: per,
        slug: musicPlayerFactory.getCurrentSong().slug
      });
      const percent = maxWidth * per;
      $rootScope.percent = per;
      $element.find('.song-timer__fill').css('width', `${percent}px`);
      $element.find('.song-timer__handle').css('margin-left', `${percent - 5}px`);
      $scope.songInfo.minutes = Math.floor(time / 60);
      $scope.songInfo.seconds = Math.floor(time % 60);
      if ($scope.songInfo.seconds < 10) {
        $scope.songInfo.seconds = `0${$scope.songInfo.seconds}`;
      }
      if ((time >= duration) && !$scope.isMoveTime && ($scope.isPlaying === true)) {
        if (($scope.currentSongIndex < (musicPlayerFactory.getPlaylist().length - 1)) || $scope.playerControls.repeat) {
          $scope.nextSong();
        }
      }
      if (!$scope.$$phase && !$scope.$root.$$phase) {
        return $scope.$apply();
      }
    };


    //  `7MMF'`7MN.   `7MF'`7MMF'MMP""MM""YMM
    //    MM    MMN.    M    MM  P'   MM   `7
    //    MM    M YMb   M    MM       MM
    //    MM    M  `MN. M    MM       MM
    //    MM    M   `MM.M    MM       MM
    //    MM    M     YMM    MM       MM
    //  .JMML..JML.    YM  .JMML.   .JMML.


    $scope.ready = false;
    $scope.internalReady = false;
    $scope.currentSongIndex = -1;
    $scope.isPlaying = false;
    $rootScope.isPlaying = false;
    $scope.playerControls = musicPlayerFactory.getPlayerControls();

    if (musicPlayerFactory.getPlaylist().length === 0) {
      musicPlayerFactory.loadPlaylist().then(() => {
        $scope.playlist = musicPlayerFactory.getPlaylist();
        $scope.internalReady = true;
        // $scope.ready = true;
      });
    }
    else {
      $scope.internalReady = true;
      // $scope.ready = true;
      $scope.currentSongArt = musicPlayerFactory.getCurrentSong();
      musicPlayerFactory.currentSongAttr();
      $scope.playlist = musicPlayerFactory.getPlaylist();
    }
  },

  link: {
    pre($scope, element, iAttrs, controller) {
    },

    post($scope, element, iAttrs, controller) {
    }
  }
})


]);


hensApp.directive("playerMini", ["$rootScope", $rootScope =>
({
  restrict: 'A',
  controller: ["$scope", "$element", function ($scope, $element) {
    $scope.isPlaying = false;
    $scope.togglePlay = () => $scope.$emit('togglePlay');
    this.setState = bool => {
      $scope.isPlaying = bool;
    };
    this.setState(false);
    $scope.$on('play-state-updated', (event, data) => {
      if (!this.musicBound || this.musicBound === data.slug) {
        this.setState(data.state);
      }
    });
    $scope.$on('song-info-updated', (event, data) => {
      $scope.songInfo = data;
    });
  }]
})


]);

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}