/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('gameArticle', ['userFactory',userFactory=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials + 'gameArticle.html',
    scope: {
      user:'=',
      post:'=',
      isFav:'='
    },
    controller($scope,$element){
      $scope.likePost=()=> $scope.$parent.likePost();

      $scope.userManager = userFactory;

      $scope.img = document.getElementById('imgGame');
      $scope.isImageLoaded=function(){
        if ($scope.img.complete) {
          const img = new Image();   
          img.src = $scope.post.images[0];
          const { width } = img;
          const { height } = img;
          const containerW = $element.find('.image-container').width();
          const containerH = $element.find('.image-container').height();
          const ratio = width/ height;
          if (ratio >= 1.776) {
            $('#imgGame').attr('width', containerW);
            $('#imgGame').attr('height', containerW / ratio);
            $('#imgGame').css('margin-top', (containerH - (containerW / ratio)) / 2 ); 
          }
          if (ratio < 1.776) {
            $('#imgGame').attr('height', containerH);
            $('#imgGame').attr('width', containerH * ratio);
          }
          return $scope.$parent.info.isAppInit= true;
        } else { 
          return setTimeout($scope.isImageLoaded,1000/50);
        }
      };
      $scope.isImageLoaded();

    }
  })


]);
