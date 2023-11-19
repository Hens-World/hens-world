angular.module('app').component('searchSeriesPost', {
  templateUrl: myLocalized.partials + 'searchSeries.html',
  bindings: {},
  controllerAs: 'ctrl',
  controller: [
    '$scope', '$element', '$rootScope', 'seriesFactory', 'postFactory',
    function ($scope, $element, $rootScope, seriesFactory, postFactory) {
      this.searchString = "";
      this.selectPost = (post) => {
        post.selected = !post.selected;
        this.sortPosts();
      }

      this.close = () => {
        $scope.$emit('searchSeries:close');
      }

      /**
       * Sends selected posts to parent
       */
      this.addPosts = () => {
        $scope.$emit('searchSeries:posts', this.posts.filter(post => post.selected));
        this.close();
      };

      this.sortPosts = () => {
        this.orderedPosts.sort((a, b) => {
          let aDate = moment(a.date);
          let bDate = moment(b.date);
          if (a.selected && !b.selected) return -1; else if (b.selected && !a.selected) return 1; else {
            if (aDate.isBefore(bDate)) return 1; else if (bDate.isBefore(aDate)) return -1; else return 0;
          }
        });
        this.filteredPosts = this.orderedPosts.filter(post => {
          return post.selected || this.searchString.length === 0 || post.title.toLowerCase().indexOf(this.searchString.toLowerCase()) >= 0;
        });

        this.displayedPosts = this.posts
          .filter(post => this.filteredPosts.findIndex(orderPost => orderPost.id === post.id) >= 0)
          .map((post, index) => {
            post.order = this.filteredPosts.findIndex((orderPost) => orderPost.id === post.id);
            return post;
          });
      };

      this.updateSearch = () => {
        this.sortPosts();
      }

      this.inited = false;
      this.$onInit = () => {
        if (!$rootScope.currentUser) {

          $rootScope.$watch('currentUser', (n, o) => {
            if (n && !o) {
              this.init();
            }
          });
        }
        else {
          this.init();
        }
      };

      this.init = () => {
        postFactory.getPosts({
          author: $rootScope.currentUser.ID,
          page: 1,
          pageSize: 500,
        }).then((res) => {
          this.posts = res.data;
          this.posts.forEach((post) => {
            post.formatDate = hensApp.formatPhraseDate(post.date);
          });
          this.orderedPosts = [].concat(this.posts);
          this.sortPosts();
        });

        $scope.$on('searchPostStart', (event, excludeList) => {
          this.loading = true;
          postFactory.getPosts({
            author: $rootScope.currentUser.ID,
            page: 1,
            pageSize: 500,
          }).then((res) => {
            this.posts = res.data.filter(post => !excludeList.includes(post.id));
            this.posts.forEach((post) => {
              post.formatDate = moment(post.date).format(hensApp.DATE_FORMATS.MIDDLE);
            });
            this.orderedPosts = [].concat(this.posts);
            this.sortPosts();
            this.loading = false;
          });
        });
      }
    }
  ]
});
