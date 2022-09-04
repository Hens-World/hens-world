angular.module('app').component('postLike', {
  templateUrl: myLocalized.partials + 'postLike.html',
  bindings: {
    postId: "<",
    likes: "=",
    golden: "<"
  },
  controllerAs: 'likeCtrl',
  controller: ['postFactory', '$rootScope', '$scope', function (postFactory, $rootScope, $scope) {
    this.isLiked = false;
    this.updateIsLiked = () => {
      if (!!$rootScope.currentUser) {
        this.isLiked = !!this.likes.find(like => like.author.ID === $rootScope.currentUser.ID);
      }
    };

    this.$onInit = () => {
      this.updateIsLiked();
    };

    this.likePost = () => {
      if (this.isLiked) {
        postFactory.deleteLike(this.postId).then(res => {
          this.likes = this.likes.filter(like => like.user_id !== $rootScope.currentUser.ID);
          this.updateIsLiked();
        });
      } else {
        postFactory.createLike(this.postId).then(res => {
          this.likes.unshift(res.data);
          this.updateIsLiked();
        }).catch((e) => {
          $rootScope.setAlert('error', e.data.msg, 50);
        });
      }
    };

    this.showList = () => {
      $scope.$emit('show-like-list', this.likes);
    }
  }]
});