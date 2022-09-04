/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('playlistDisplay', ['userFactory', 'musicPlayerFactory', (userFactory, musicPlayerFactory) =>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'playlistDisplay.html',
    scope: {
      user: '='
    },
    controller($scope, $element) {
      $scope.tempAudios = {};

      $scope.userManager = userFactory;
      $scope.$watch('user', function (newValue, oldValue) {
        if ((newValue !== oldValue) && newValue) {
          return $scope.checkLikedMusic();
        }
      });

      $scope.$on('playlist-updated', (event, data) => {
        $scope.playlist = data.playlist;
      });

      $scope.checkLikedMusic = function () {
        if ($scope.user.meta !== undefined) {
          if (($scope.user.meta.meta.likedPosts !== undefined) && ($scope.playlist !== undefined)) {
            $scope.listLiked = $scope.user.meta.meta.likedPosts[0].split(':');
            return Array.from($scope.playlist).map((music) =>
              (() => {
                const result = [];
                for (let post of Array.from($scope.listLiked)) {
                  if (parseInt(post) === music.ID) {
                    result.push(music.isFav = true);
                  } else {
                    result.push(undefined);
                  }
                }
                return result;
              })());
          }
        }
      };

      $scope.changeSong = music => $scope.$emit('changeSong', music);

      $scope.getDuration = function (music, index) {
        $scope.tempAudios[music.slug] = new Audio();
        return;
        $scope.tempAudios[music.slug].src = music.source;
        return $scope.tempAudios[music.slug].addEventListener('loadedmetadata', () => {
          const {duration} = $scope.tempAudios[music.slug];
          const m = Math.floor(duration / 60);
          let s = Math.floor(duration % 60);
          if (s < 10) {
            s = `0${s}`;
          }
          $scope.playlist[index].formatDuration = `${m}:${s}`;
          $scope.tempAudios[music.slug].pause();
          $scope.tempAudios[music.slug].src = "";
          $scope.tempAudios[music.slug].load();
          return setTimeout(() => {
              return delete $scope.tempAudios[music.slug];
            }
            , 10);
        });
      };
      $scope.init = () => {
        if (musicPlayerFactory.getPlaylist().length > 0) {
          $scope.playlist = musicPlayerFactory.getPlaylist();
          setTimeout(
            () => $('.playlist-container').niceScroll(hensApp.niceScrollOptions)
            , 1000);
          for (let index = 0; index < $scope.playlist.length; index++) {
            const music = $scope.playlist[index];
            $scope.getDuration(music, index);
          }
          if ($scope.user) {
            return $scope.checkLikedMusic();
          }
        } else {
          setTimeout(() => $scope.init(), 200);
        }
      };

      $scope.init();
    }
  })


]);
