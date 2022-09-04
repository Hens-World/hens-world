angular.module('app').component('likeList', {
  templateUrl: myLocalized.partials + 'likeList.html',
  bindings: {

  },
  controllerAs: 'likeListCtrl',
  controller: ['$rootScope', function($rootScope) {
    this.visible = false;
    $rootScope.$on('show-like-list', (event, data)=> {
      this.likes = data.map(like=> {
        like.formattedDate = moment(like.created_at).format(hensApp.DATE_FORMATS.PRECISE);
        return like;
      });
      this.showList();
    });

    this.hideList = () => {
      this.visible = false;
    };

    this.showList = () => {
      this.visible = true;
    };
  }]
});