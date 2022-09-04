/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('createGame', [
  'postFactory', '$rootScope', '$location', (postFactory, $rootScope, $location) => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'createGame.html',
    scope: {
      type: "=",
      existingPost: "=post",
      village: "="
    },
    controller($scope, $element) {

      $scope.switchStatus = function () {
        if ($scope.post.status === "publish") {
          $scope.post.status = "draft";
        } else {
          $scope.post.status = "publish";
        }
      };

      //
      //  `7MM"""Mq.                    mm
      //    MM   `MM.                   MM
      //    MM   ,M9 ,pW"Wq.  ,pP"Ybd mmMMmm
      //    MMmmdM9 6W'   `Wb 8I   `"   MM
      //    MM      8M     M8 `YMMMa.   MM
      //    MM      YA.   ,A9 L.   I8   MM
      //  .JMML.     `Ybmd9'  M9mmmP'   `Mbmo
      //
      //
      $scope.isPostValid = function () {
        if ($scope.post.location != null) {
          if ($scope.post.title !== undefined) {
            return true;
          } else {
            $rootScope.setAlert('error', 'creation_notitre');
            return false;
          }
        } else {
          $rootScope.setAlert('error', 'creation_nolieu');
          return false;
        }
      };

      $scope.updatePost = function () {
        if ($scope.isPostValid()) {
          return $scope.$parent.updatePost({
            ID: $scope.post.ID,
            status: $scope.post.status,
            title: $scope.post.title,
            type: $scope.post.type,
            authors: $scope.post.authors,
            miniature: $scope.post.miniature,
            lieu: $scope.post.location.id,
            content: $scope.post.content,
            village: hensApp.villageToTag[$scope.post.village.slug],
            personnagesLies: $scope.post.personnagesLies,
            genre: $scope.post.genre,
            image: [$scope.post.image],
            joueurs: $scope.post.joueurs,
            lien: $scope.post.lien,
            support: $scope.post.support
          });
        }
      };

      $scope.createPost = function () {
        if ($scope.isPostValid()) {
          return $scope.$parent.createPost({
            status: $scope.post.status,
            title: $scope.post.title,
            type: 'jeux_videos',
            authors: $scope.post.authors,
            miniature: $scope.post.miniature,
            personnagesLies: $scope.post.personnagesLies,
            lieu: $scope.post.location.id,
            content: $scope.post.content,
            village: hensApp.villageToTag[$scope.post.village.slug],
            genre: $scope.post.genre,
            image: [$scope.post.image],
            joueurs: $scope.post.joueurs,
            lien: $scope.post.lien,
            support: $scope.post.support
          });
        }
      };

      $scope.sendPost = function () {
        $scope.post = hensApp.defineMiniature($scope.post);
        if ($scope.existingPost !== undefined) {
          return $scope.updatePost();
        } else {
          return $scope.createPost();
        }
      };

      $scope.switchStatus = function () {
        if ($scope.post.status === "publish") {
          return $scope.post.status = "draft";
        } else {
          return $scope.post.status = "publish";
        }
      };

      //
      //                      ,,
      //  `7MMF'              db   mm
      //    MM                     MM
      //    MM  `7MMpMMMb.  `7MM mmMMmm
      //    MM    MM    MM    MM   MM
      //    MM    MM    MM    MM   MM
      //    MM    MM    MM    MM   MM
      //  .JMML..JMML  JMML..JMML. `Mbmo
      //
      //
      $scope.villageToTag = {
        sulimo: 3,
        anar: 2,
        wilwar: 10,
        ulmo: 7
      };

      $scope.postManager = postFactory;

      if ($scope.existingPost === undefined) {
        $scope.post = {
          miniature: "",
          authors: [],
          lieu: $location.search().location || 0,
          village: 0,
          image: '',
          lien: '',
          support: '',
          joueurs: '',
          type: $scope.type,
          status: 'publish',
          content: ''
        };
      } else {
        $scope.post = $scope.existingPost;
        $scope.post.image = $scope.post.images[0];
      }

      $scope.listeners = $scope.$parent.configureWatchers($rootScope, $scope);

      $scope.$watch('post.content', function (n, o) {
        if ((n !== o) && ($scope.post.content.indexOf('$nextpage$') > -1)) {
          return $scope.post.content =
            $scope.post.content.replace('$nextpage$', '<p class="next-page-symbol">Changement de page</p>');
        }
      });

      $scope.$on('$destroy', () => {
        $scope.listeners.forEach((listener) => {
          listener();
        });
      });

    }
  })

]);
