hensApp.directive('createEcrit', [
  'postFactory', '$sce', '$rootScope', '$location', (postFactory, $sce, $rootScope, $location) => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'createEcrit.html',
    scope: {
      type: "=",
      existingPost: "=post",
      village: "="
    },
    controller($scope, $element) {
      //  `7MM"""Mq.                    mm
      //    MM   `MM.                   MM
      //    MM   ,M9 ,pW"Wq.  ,pP"Ybd mmMMmm
      //    MMmmdM9 6W'   `Wb 8I   `"   MM
      //    MM      8M     M8 `YMMMa.   MM
      //    MM      YA.   ,A9 L.   I8   MM
      //  .JMML.     `Ybmd9'  M9mmmP'   `Mbmo

      $scope.typeList = [
        {
          name: "Récit",
          slug: "recit"
        }, {
          name: "Légende",
          slug: "legende"
        }, {
          name: "Article",
          slug: "article"
        }
      ];

      $scope.chooseType = (type) => {
        $scope.chosenType = type;
        $scope.post.type = type.slug;
      };

      $scope.isPostValid = function () {
        if ($scope.post.location != null) {
          if ($scope.post.title !== undefined && $scope.post.title.length > 0) {
          } else {
            $rootScope.setAlert('error', 'creation_notitre');
            return false;
          }
        } else {
          $rootScope.setAlert('error', 'creation_nolieu');
          return false;
        }

        if (!$scope.post.type) {
          $rootScope.setAlert('error', 'Veuillez sélectionner un type d\'écrit');
        }
        return true;
      };

      $scope.formatContent = () => // TODO check the validity of next-page tag with html parsing, i guess ??....
        $scope.post.content = hensApp.replaceAll('<p class="next-page-symbol"></p>', '$nextpage$', $scope.post.content);

      $scope.updatePost = function () {
        $scope.formatContent();
        if ($scope.isPostValid()) {
          return $scope.$parent.updatePost({
            ID: $scope.post.ID,
            status: $scope.post.status,
            title: $scope.post.title,
            content: $scope.post.content,
            type: $scope.post.type,
            authors: $scope.post.authors,
            miniature: $scope.post.miniature,
            lieu: $scope.post.location.id,
            personnagesLies: $scope.post.personnagesLies,
            village: hensApp.villageToTag[$scope.post.village.slug]
          });
        }
      };

      $scope.createPost = function () {
        $scope.formatContent();
        if ($scope.isPostValid()) {
          //author formatting
          return $scope.$parent.createPost({
            title: $scope.post.title,
            type: $scope.post.type,
            status: $scope.post.status,
            content: $scope.post.content,
            miniature: $scope.post.miniature,
            authors: $scope.post.authors,
            personnagesLies: $scope.post.personnagesLies,
            lieu: $scope.post.location.id,
            village: hensApp.villageToTag[$scope.post.village.slug]
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
          $scope.post.status = "draft";
        } else {
          $scope.post.status = "publish";
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

      $scope.postManager = postFactory;

      if ($scope.existingPost === undefined) {
        $scope.post = {
          miniature: "",
          authors: [],
          lieu: $location.search().location || 0,
          village: 0,
          status: 'publish',
          content: '',
          type: $scope.type
        };
      } else {
        $scope.post = $scope.existingPost;
        $scope.chooseType($scope.typeList.find(type => type.slug === $scope.post.type));
      }

      $scope.listeners = $scope.$parent.configureWatchers($rootScope, $scope);

      $scope.$watch('post.content', function (n, o) {
        if ((n !== o) && ($scope.post.content.indexOf('$nextpage$') > -1)) {
          return $scope.post.content = $scope.post.content.replace('$nextpage$', '<p class="next-page-symbol"></p>');
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
