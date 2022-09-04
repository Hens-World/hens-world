hensApp.directive('authorArticle', [
  'userFactory', '$http', 'postFactory', (userFactory, $http, postFactory) => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'authorArticle.html',
    scope: {
      authorsInfo: '=',
      user: '='
    },
    controller($scope, $element) {
      $scope.$watch('user', function (newValue, oldValue) {
        if (($scope.user.meta !== undefined) && ($scope.author !== undefined)) {
          return $scope.isAuthorFav();
        }
      });

      $scope.$watch('author', function (newValue, oldValue) {
        if (($scope.user.meta !== undefined) && ($scope.author !== undefined)) {
          $scope.isAuthorFav();
        }
      });

      $scope.isAuthorFav = function () {
        if ($scope.user.likedContribs !== undefined) {
          $scope.likedContribs = $scope.user.likedContribs.split(':');
          return (() => {
            const result = [];
            for (let contrib of Array.from($scope.likedContribs)) {
              if (parseInt(contrib) === $scope.author.ID) {
                $scope.isFav = true;
                result.push($scope.author.village);
              } else {
                result.push(undefined);
              }
            }
            return result;
          })();
        }
      };

      $scope.displayUserMulti = function (res) {
        const fiche = res.data;
        const author = $scope.authorsInfo.find(author => author.ID === fiche.user_id);
        if (!author.avatar) {
          author.avatar = [myLocalized.medias + 'profil/no-avatar.png'];
        }
        author.fiche = fiche;
        $scope.authorList.push(author);
      };

      $scope.init = function () {
        $scope.isAuthorInit = true;
        $scope.postManager = postFactory;
        $scope.author = $scope.authorsInfo[0];
        userFactory.getProfileFiche($scope.author.ID).then(function (res) {
          $scope.author.fiche = res.data;
          if (($scope.user) && ($scope.authorsInfo.length === 1)) {
            $scope.isAuthorFav();
          }
          if ($scope.authorsInfo.length <= 1) {
            $scope.isAlone = true;
            return $scope.isMulti = false;
          } else {
            $scope.isAlone = false;
            $scope.isMulti = true;

            $scope.authorList = [];
            $scope.authorList.push($scope.author);

            $scope.authorsInfo.map((author) => {
              if (author.ID !== $scope.author.ID) {
                userFactory.getProfileFiche(author.ID).then($scope.displayUserMulti);
              }
            });
            setTimeout(() => {
              $('.author-multi-container').niceScroll(hensApp.niceScrollOptions);
            }, 200);

          }
        });
      };
      //init

      $scope.userManager = userFactory;
      $scope.isAuthorInit = false;
      $scope.$watchCollection('authorsInfo', function (newValue, oldValue) {
        if ((newValue !== undefined) && (newValue !== "") && !$scope.isAuthorInit) {
          return $scope.init();
        }
      });

      return $scope.$on('$destroy', () => $('.author-multi-container').getNiceScroll().remove());
    }
  })

]);
