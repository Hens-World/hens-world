/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('createMusiques', ['postFactory', '$rootScope', '$location', (postFactory, $rootScope, $location)=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials + 'createMusique.html',
    scope: {
      existingPost: '=post',
      type:'=',
      village: "="
    },
    controller($scope,$element){
      $scope.switchStatus=function(){
        if ($scope.post.status === "publish") {
          return $scope.post.status = "draft";
        } else {
          return $scope.post.status = "publish";
        }
      };

      $scope.isPostValid= function(){
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

      $scope.updatePost=function(){
        if ($scope.isPostValid()) {
          $scope.$parent.updatePost({
            ID:$scope.post.ID,
            status: $scope.post.status,
            title: $scope.post.title,
            content: $scope.post.content,
            personnagesLies: $scope.post.personnagesLies,
            type: $scope.post.type,
            authors: $scope.post.authors,
            miniature: $scope.post.miniature,
            lieu: $scope.post.location.id,
            village: hensApp.villageToTag[$scope.post.village.slug],
            musique: $scope.post.musique
          });
        }
      };

      $scope.createPost =function(){
        if ($scope.isPostValid()) {
          return $scope.$parent.createPost({
            status: $scope.post.status,
            title: $scope.post.title,
            type: 'musiques',
            authors: $scope.post.authors,
            personnagesLies: $scope.post.personnagesLies,
            content: $scope.post.content,
            miniature: $scope.post.miniature,
            lieu: $scope.post.location.id,
            village: hensApp.villageToTag[$scope.post.village.slug],
            musique: $scope.post.musique
          });
        }
      };

      $scope.sendPost =function(){
        $scope.post = hensApp.defineMiniature($scope.post);
        if ($scope.existingPost !== undefined) {
          return $scope.updatePost();
        } else {
          return $scope.createPost();
        }
      };


      $scope.switchStatus=function(){
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
        sulimo:3,
        anar:2,
        wilwar:10,
        ulmo:7
      };
      if ($scope.existingPost === undefined) {
        $scope.post = {
          miniature : "",
          authors:[],
          musique: "",
          lieu: $location.search().location || 0,
          village: 0,
          type: $scope.type,
          status: 'publish'
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
  })

]);
