angular.module('app').component('searchObject', {
  templateUrl: myLocalized.partials + 'searchObject.html',
  controllerAs: 'ctrl',
  bindings: {
    type: '=',
    foundValue: '='
  },
  controller: [
    '$scope', '$element', '$rootScope', 'postFactory', 'userFactory', 'seriesFactory',
    function ($scope, $element, $rootScope, postFactory, userFactory, seriesFactory) {

      this.searchInput = "";

      this.selectObject = (result) => {
        result.originalObject.detail = result.detail;
        this.foundValue = result.originalObject;
        this.results = [];
        this.searchInput = "";
      };

      this.onInput = (inputValue) => {
        if (inputValue.length < 3) {
          this.results = [];
          return;
        }

        switch (this.type) {
          case "post":
            postFactory.search(this.searchInput).then((posts) => {
              this.results = posts.data.filter(post=> post.post_author === $rootScope.currentUser.ID).map(post => {
                return {
                  originalObject: post,
                  miniature: post.miniature,
                  title: post.title,
                  detail: hensApp.formatPhraseDate(post.post_date)
                }
              });
            }).catch($rootScope.handleError);
            break;
          case "serie":
            seriesFactory.searchByName(this.searchInput).then((series) => {
              this.results = series.data.map(serie => {
                return {
                  originalObject: serie,
                  miniature: serie.miniature,
                  title: serie.title,
                  detail: serie.relationships.length + " créations"
                }
              });
            });
            break;
        }
      };

      this.$onInit = () => {

      };
    }
  ]
});