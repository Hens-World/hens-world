/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('createVideos', [
  'postFactory', '$location', '$rootScope', function (postFactory, $location, $rootScope) {
    return {
      restrict: 'A',
      templateUrl: myLocalized.partials + 'createVideo.html',
      scope: {
        type: "=",
        existingPost: "=post",
        village: "="
      },
      controller($scope, $element) {
        $scope.switchStatus = function () {
          if ($scope.post.status === "publish") {
            return $scope.post.status = "draft";
          } else {
            return $scope.post.status = "publish";
          }
        };

        //  `7MM"""Mq.                    mm
        //    MM   `MM.                   MM
        //    MM   ,M9 ,pW"Wq.  ,pP"Ybd mmMMmm
        //    MMmmdM9 6W'   `Wb 8I   `"   MM
        //    MM      8M     M8 `YMMMa.   MM
        //    MM      YA.   ,A9 L.   I8   MM
        //  .JMML.     `Ybmd9'  M9mmmP'   `Mbmo

        $scope.isPostValid = function () {
            if (!$scope.post.title || $scope.post.title.length < 3) {
              $rootScope.setAlert('error', 'creation_notitre');
              return false;
            }
            if ($scope.post.location == null) {
              console.log($scope.post);
              $rootScope.setAlert('error', 'creation_nolieu');
              return false;
            }
          if (($scope.post.description.length == 0) || ($scope.post.video.length == 0)) {
            $rootScope.setAlert('error', "Vous n'avez pas rempli tous les champs, veuillez réessayer.");
            return false;
          }
          return true;
        };

        $scope.updatePost = function () {
          if ($scope.isPostValid()) {
            $scope.$parent.updatePost({
              ID: $scope.post.ID,
              status: $scope.post.status,
              title: $scope.post.title,
              type: $scope.post.type,
              authors: $scope.post.authors,
              personnagesLies: $scope.post.personnagesLies,
              miniature: $scope.post.miniature,
              lieu: $scope.post.location.id,
              content_raw: '',
              village: hensApp.villageToTag[$scope.post.village.slug],
              video: $scope.post.video,
              description: $scope.post.description
            });
          }
        };

        $scope.createPost = function () {
          if ($scope.isPostValid()) {
            $scope.$parent.createPost({
              status: $scope.post.status,
              title: $scope.post.title,
              type: $scope.post.type,
              authors: $scope.post.authors,
              personnagesLies: $scope.post.personnagesLies,
              miniature: $scope.post.miniature,
              lieu: $scope.post.location.id,
              content_raw: '',
              village: hensApp.villageToTag[$scope.post.village.slug],
              video: $scope.post.video,
              description: $scope.post.description
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

        //                        ,,
        //  `7MMF'                db    mm
        //    MM                        MM
        //    MM   `7MMpMMMb.   `7MM  mmMMmm
        //    MM     MM    MM     MM    MM
        //    MM     MM    MM     MM    MM
        //    MM     MM    MM     MM    MM
        //  .JMML. .JMML  JMML. .JMML.  `Mbmo

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
            status: 'publish',
            video: '',
            description: '',
            type: $scope.type
          };
        } else {
          $scope.post = $scope.existingPost;
        }

        $scope.listeners = $scope.$parent.configureWatchers($rootScope, $scope);

        $scope.$on('$destroy', () => {
          $scope.listeners.forEach((listener) => {
            listener();
          });
        });
      }
    }
  }
]);
