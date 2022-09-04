/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('commentArticle', ['$rootScope', 'postFactory', function ($rootScope, postFactory) {
  return {
    restrict: 'A',
    templateUrl: myLocalized.partials + 'commentArticle.html',
    scope: {
      isConnected: '=',
      author: '=',
      postId: '=',
      comments: '='
    },
    controller($scope, $element) {
      $scope.commentContent = '';
      $scope.currentEdit = '';
      $scope.sendComment = function () {
        const commentData = {
          post_id: $scope.postId,
          user_id: $scope.$parent.info.user.ID,
          content: $scope.formatContent($scope.commentContent),
        };
        $scope.commentContent = '';
        postFactory.createComment(commentData).then(function (res) {
          if ($rootScope.currentUser.ID !== $scope.author.ID) {
            $rootScope.socket.emit('notification:comment', {
              user: $rootScope.currentUser.ID,
              post: $scope.postId
            });
          }
          $scope.comments.unshift($scope.formatComment(res.data));
        }).catch($rootScope.handleError);
      };

      $scope.deleteComment = (comment, index)=>{
        $rootScope.$emit('modal:set', {
          title: 'Supprimer un commentaire',
          text: `Êtes vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.`,
          validation: () => {
            postFactory.deleteComment(comment).then(()=>{
              $scope.comments.splice(index, 1);
              $rootScope.setAlert('success', 'Commentaire supprimé ! ');
            }).catch($rootScope.handleError);
          }
        });
      };

      $scope.toggleEdit = function (index) {
        if (!$scope.comments[index].haEdit) {
          for (let comment of Array.from($scope.comments)) {
            comment.haEdit = false;
          }
          $scope.comments[index].haEdit = true;
          $scope.currentEdit = $scope.comments[index].content;
          $scope.currentEdit = hensApp.replaceAll('<p>', '', $scope.currentEdit);
          $scope.currentEdit = hensApp.replaceAll('</p>', '', $scope.currentEdit);
          $scope.currentEdit = $scope.parseContent($scope.currentEdit);
          $('.content-edit').eq(index).find('.write-comment').html($scope.currentEdit);
          return;
        } else {
          return $scope.comments[index].haEdit = false;
        }
      };


      $scope.editComment = function (comment, index) {
        const commentData = {
          ID: comment.ID,
          post_id: $scope.postId,
          user_id: $scope.$parent.info.user.ID,
          content: $scope.formatContent($('.content-edit').eq(index).find('.write-comment').val()),
        };
        postFactory.editComment(commentData).then(function (res) {
          res = res.data;
          for (comment of Array.from($scope.comments)) {
            if (comment.ID === parseInt(res.ID)) {
              comment.content = res.content;
              comment.haEdit = false;
            }
          }
          return $scope.commentContent = '';
        });
      };

      $scope.init = function () {
        for (let comment of $scope.comments) {
          $scope.formatComment(comment)
        }
      };

      $scope.formatComment = function (comment) {
        if (comment.author.avatar === undefined) {
          comment.author.avatar = [myLocalized.medias + 'profil/no-avatar.png'];
        }
        comment.formatDate = moment(comment.date).format('YYYY/MM/DD  HH:mm');
        return comment;
      };

      $scope.formatContent = function (content) {
        return hensApp.formatContent(content);
      };

      $scope.parseContent = function (content) {
        return hensApp.parseContent(content);
      };

      $scope.isCommentRetrieved = false;
      return $scope.$watch('comments', function (newValue, oldValue) {
        if (newValue) {
          return $scope.init();
        }
      });
    }
  }
}]);
