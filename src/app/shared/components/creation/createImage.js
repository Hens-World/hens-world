/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('createImages', ['postFactory','$http', '$rootScope', '$location', (postFactory,$http, $rootScope, $location)=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials + 'createImage.html',
    scope: {
      existingPost: '=post',
      type:'=',
      village: '='
    },
    controller($scope,$element){
      $scope.switchStatus=function(){
        if ($scope.post.status === "publish") {
          return $scope.post.status = "draft";
        } else {
          return $scope.post.status = "publish";
        }
      };

      $scope.getNumber = function(nb){
        $scope.post.titres.length = nb;
        $scope.post.descriptions.length = nb;
        $scope.post.images.length = nb;
        const arr =  new Array(parseInt(nb));
        for (let i = 0, end = nb - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
          arr[i] = i;
        }
        return arr;
      };

      $scope.isPostValid= function(){
        if ($scope.post.title !== undefined) {
          if ($scope.post.location != null) {
            return true;
          } else {
            $rootScope.setAlert('error', 'creation_nolieu');
            return false;
          }
        } else {
          $rootScope.setAlert('error', 'creation_notitre');
          return false;
        }
      };

      $scope.$on('destroy', function(){
        if ($scope.existingPost === undefined) {
          return $scope.createPost();
        }
      });

      $scope.updatePost=function(){
        if ($scope.isPostValid()) {
          return $scope.$parent.updatePost({
            ID:$scope.post.ID,
            status: $scope.post.status,
            title: $scope.post.title,
            type: $scope.post.type,
            authors: $scope.post.authors,
            miniature: $scope.post.miniature,
            personnagesLies: $scope.post.personnagesLies,
            lieu: $scope.post.location.id,
            village: hensApp.villageToTag[$scope.post.village.slug],
            titre: $scope.post.titres,
            description: $scope.post.descriptions,
            image: $scope.post.images
          });
        }
      };
      $scope.createPost =function(){
        if ($scope.isPostValid()) {
          //author formatting
          return $scope.$parent.createPost({
            status: $scope.post.status,
            title: $scope.post.title,
            type: $scope.post.type,
            authors: $scope.post.authors,
            miniature: $scope.post.miniature,
            lieu: $scope.post.location.id,
            personnagesLies: $scope.post.personnagesLies,
            village: hensApp.villageToTag[$scope.post.village.slug],
            titre:$scope.post.titres,
            description: $scope.post.descriptions,
            image: $scope.post.images
          });
        }
      };


      $scope.sendPost =function(){
        $scope.post = hensApp.defineMiniature($scope.post);
        $scope.formatOptionalInputs();
        if ($scope.existingPost !== undefined) {
          return $scope.updatePost();
        } else {
          return $scope.createPost();
        }
      };


      $scope.formatOptionalInputs = function(){
        let index;
        for (index = 0; index < $scope.post.titres.length; index++) {
          const title = $scope.post.titres[index];
          $scope.post.titres[index] = (title == null) ? " " : title;
        }
        return (() => {
          const result = [];
          for (index = 0; index < $scope.post.descriptions.length; index++) {
            const description = $scope.post.descriptions[index];
            result.push($scope.post.descriptions[index] = (description == null) ? " " : description);
          }
          return result;
        })();
      };



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

      $scope.mainTitleList = {
        images: 'Nouvelle Image',
        photos: 'Nouvelle Photo'
      };
      $scope.mainTitle = $scope.mainTitleList[$scope.type];

      $scope.postManager = postFactory;
      $scope.villageToTag = {
        sulimo:3,
        anar:2,
        wilwar:10,
        ulmo:7
      };


      $scope.mainTitle = $scope.mainTitleList[$scope.type];
      $scope.postManager = postFactory;

      if ($scope.existingPost === undefined) {
        $scope.post = {
          miniature : "",
          authors:[],
          galerieLength: 1,
          images: [],
          titres: [],
          descriptions: [],
          lieu: $location.search().location || 0,
          village: 0,
          status: 'publish',
          type: $scope.type
        };
      } else {
        $scope.post = $scope.existingPost;
        $scope.post.galerieLength = $scope.post.titres.length;
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
