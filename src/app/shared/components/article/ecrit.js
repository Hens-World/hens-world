/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('ecritArticle',['userFactory','$sce',(userFactory,$sce)=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials + 'ecrit.html',
    scope: {
      post:'=',
      user:'=',
      isFav:'='
    },
    controller($scope,$element){
      let meta;
      $scope.likePost=()=> $scope.$parent.likePost();
      $scope.setPage = function(page){
        $scope.currentPage = page - 1;
        $('.article-global-container').animate({
          scrollTop:0
        },200);
        return false;
      };
      $scope.currentPage = 0;
      $scope.$parent.info.isAppInit = true;
      $scope.userManager = userFactory;

      for (let key in $scope.post.custom_meta) {
        meta = $scope.post.custom_meta[key];
        if ((meta.length === 1) && (meta[0][0] === "[") && (meta[0][meta[0].length - 1] === "]")) {
          $scope.post.custom_meta[key] = JSON.parse(meta[0]);
        }
      }


      if ($scope.post.type ==="article") {
        $('.type').css('background',hensApp.color.ulmo.neuter);
      } else if ($scope.post.type ==="recit") {
        $('.type').css('background',hensApp.color.wilwar.neuter);
      } else if ($scope.post.type ==="legende") {
        $('.type').css('background',hensApp.color.anar.neuter);
      }
      $scope.post.contentPaged = $scope.post.content.split('$nextpage$');
      for (let content of Array.from($scope.post.contentPaged)) {
        content = $sce.trustAsHtml(content);
      }

      $scope.trust= string=> $sce.trustAsHtml(string);
      $scope.numberPage = [];
      for (let page = 1, end = $scope.post.contentPaged.length, asc = 1 <= end; asc ? page <= end : page >= end; asc ? page++ : page--) {
        $scope.numberPage.push(page);
      }

    }
  })



]);
