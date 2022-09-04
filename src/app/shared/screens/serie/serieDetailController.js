hensApp.controller('SerieDetail', [
  '$scope', 'seriesFactory', 'localeFactory', 'postFactory', '$location', '$rootScope', '$routeParams',
  function ($scope, seriesFactory, localeFactory, postFactory, $location, $rootScope, $routeParams) {
    $scope.$parent.info.isAppInit = false;
    $rootScope.$emit('bottomNav:select', "Guide");

    setTimeout(() => {
      seriesFactory.getSerieById(parseInt($routeParams.serieid)).then(res => {
        $scope.serie = res.data;
        $scope.serie.creationTypes = [...new Set($scope.serie.posts.map(post => TYPES[post.type]))].join(', ');
        $scope.serie.authors = [res.data.owner];
        $scope.serie.posts = $scope.serie.posts
          .map(post => {
            let relationship = $scope.serie.relationships.find(relationship => relationship.post_id === post.id);
            post.post_order = relationship.post_order;
            post.formatDate = hensApp.formatPhraseDate(post.post_date);
            return post;
          })
          .sort((a, b) => {
            if ($scope.serie.ordered) { //order ascending
              if (a.post_order < b.post_order) {
                return -1;
              } else if (a.post_order > b.post_order) {
                return 1;
              }
            } else { // date Descending
              let aDate = moment(a.post_date);
              let bDate = moment(b.post_date);
              if (aDate.isBefore(bDate)) return 1;
              if (bDate.isBefore(aDate)) return -1;
              return 0;
            }
          });

        $scope.$parent.info.isAppInit = true;
      }).catch($rootScope.handleError);
    });

  }
])