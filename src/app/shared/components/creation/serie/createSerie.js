angular.module('app').component('createSerie', {
  templateUrl: myLocalized.partials + 'createSerie.html',
  bindings: {},
  controllerAs: 'ctrl',
  controller: [
    '$scope', '$element', '$rootScope', 'seriesFactory', function ($scope, $element, $rootScope, seriesFactory) {
      this.showSearchPosts = false;

      this.serie = {
        ordered: true,
        posts: []
      };

      this.listeners = [];

      this.toggleSearchPosts = () => {
        this.showSearchPosts = !this.showSearchPosts;
        if (this.showSearchPosts) {
          $scope.$broadcast('searchPostStart', this.serie.posts.map(post => post.id));
        }
      }

      this.toggleSerieOrdered = () => {
        this.serie.ordered = !this.serie.ordered;
        this.updatePostsOrder();
      }

      this.updatePostsOrder = () => {
        this.orderedPosts.sort((a, b) => {
          if (this.serie.ordered) { //order ascending
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

        this.serie.posts.map((post, index) => {
          post.computedOrder = this.orderedPosts.findIndex(oPost => oPost.id === post.id);
        });

        setTimeout(() => {
          let i = 0;
          $element[0].querySelectorAll('.serie-post__drag').forEach(drag => {
            let j = i;
            drag.TouchStartFunction = (e) => {
              this.startDragging(e, this.serie.posts[j]);
            };
            drag.addEventListener("touchstart", drag.TouchStartFunction);
            i++;
          });
        }, 100);
      }

      this.startDragging = (mouseEvent, post) => {
        if (mouseEvent.originalEvent) {
          this.dragInitialMousePos = {
            x: mouseEvent.originalEvent.pageX,
            y: mouseEvent.originalEvent.pageY,
          }

          let containerRect = document.querySelector('.create-serie__posts').getBoundingClientRect();
          let startRect = mouseEvent.originalEvent.target.getBoundingClientRect();
          this.startPosition = {
            y: startRect.top - containerRect.top,
            x: startRect.left - containerRect.left
          };
          this.dragging = true;
          this.draggedPost = post;
          this.draggedPostElement = mouseEvent.originalEvent.target.closest('.serie-post');
          post.dragged = true;

          mouseEvent.originalEvent.preventDefault();

          window.addEventListener('mousemove', this.draggingUpdate);
          window.addEventListener('mouseup', this.stopDraggingUpdate);
          window.addEventListener('blur', this.stopDraggingUpdate);
        }
        //mobile native event
        else {
          this.dragInitialMousePos = {
            x: mouseEvent.touches[0].pageX,
            y: mouseEvent.touches[0].pageY,
          }

          let containerRect = document.querySelector('.create-serie__posts').getBoundingClientRect();
          let startRect = mouseEvent.target.getBoundingClientRect();
          this.startPosition = {
            y: startRect.top - containerRect.top,
            x: startRect.left - containerRect.left
          };
          this.dragging = true;
          this.draggedPost = post;
          this.draggedPostElement = mouseEvent.target.closest('.serie-post');
          post.dragged = true;

          mouseEvent.preventDefault();

          window.addEventListener('touchmove', this.draggingUpdate);
          window.addEventListener('touchend', this.stopDraggingUpdate);
          window.addEventListener('blur', this.stopDraggingUpdate);

        }

        this.updatePostsOrder();
      }

      this.draggingUpdate = (mouseEvent) => {
        let x, y;
        if (mouseEvent.touches && mouseEvent.touches.length > 0) {
          x = mouseEvent.touches[0].pageX;
          y = mouseEvent.touches[0].pageY;
        } else {
          x = mouseEvent.pageX;
          y = mouseEvent.pageY;
        }

        let dx = x - this.dragInitialMousePos.x;
        let dy = y - this.dragInitialMousePos.y;
        this.draggedPostElement.style.top = this.startPosition.y + dy + "px";
        this.draggedPostElement.style.left = 0 + "px";

        let previousOrder = this.draggedPost.post_order;
        this.draggedPost.post_order =
          Math.min(Math.max(0, Math.floor((this.startPosition.y + dy) / 90)), this.serie.posts.length - 1);
        if (previousOrder !== this.draggedPost.post_order) {
          this.serie.posts.forEach((post) => {
            if (post.id !== this.draggedPost.id) {
              if (previousOrder < this.draggedPost.post_order) {
                if (previousOrder < post.post_order && post.post_order === this.draggedPost.post_order) {
                  post.post_order--;
                }
              } else if (previousOrder > this.draggedPost.post_order) {
                if (previousOrder > post.post_order && post.post_order === this.draggedPost.post_order) {
                  post.post_order++;
                }
              }
            }
          });
          this.updatePostsOrder();
          // console.log(previousOrder, this.draggedPost.post_order, this.serie.posts.map(post => post.post_order), this.orderedPosts.map(post => post.post_order));
        }
      }

      this.deletePost = (post) => {
        let postIndex = this.serie.posts.findIndex(exPost => exPost.id === post.id);
        if (postIndex >= 0) {
          this.serie.posts.splice(postIndex, 1);
          this.serie.posts.forEach((post, index) => {
            if (post.order >= post.post_order) {
              post.post_order--;
            }
          });

          this.orderedPosts = [].concat(this.serie.posts);
          this.updatePostsOrder();
        }
      };

      this.stopDraggingUpdate = (mouseEvent) => {

        window.removeEventListener('mousemove', this.draggingUpdate);
        window.removeEventListener('mouseup', this.stopDraggingUpdate);
        window.removeEventListener('blur', this.stopDraggingUpdate);
        window.removeEventListener('touchmove', this.draggingUpdate);
        window.removeEventListener('touchend', this.stopDraggingUpdate);

        this.draggedPost.dragged = false;
        this.draggedPostElement.style.top = null;
        this.draggedPostElement.style.left = null;
        this.draggedPostElement = null;
        this.draggedPost = null;
      };

      this.$onInit = () => {
        $scope.$on('searchSeries:close', () => {
          this.showSearchPosts = false;
        });

        $rootScope.$emit('post:status:update', "draft");

        $scope.$on('searchSeries:posts', (event, posts) => {
          this.serie.posts =
            this.serie.posts.concat(posts.filter(post => !this.serie.posts.find(exPost => exPost.id === post.id)));
          //map trailing new ids order
          this.serie.posts.map((post, index) => {
            if (post.post_order == null) {
              post.post_order = index;
            }
          });

          this.orderedPosts = [].concat(this.serie.posts);
          this.updatePostsOrder();
        });

        this.listeners.push($rootScope.$on('startSerieCreation', (event, serie) => {
          if (serie) {
            this.serie = serie;
            this.serie.posts.forEach(post => {
              post.post_order =
                this.serie.relationships.find(relationship => relationship.post_id === post.id).post_order;
            });
            this.serie.status = this.serie.published ? "publish" : "draft";
            this.orderedPosts = [].concat(this.serie.posts);
            this.updatePostsOrder();
            $rootScope.$emit("post:status:update", this.serie.published ? "publish" : "draft");
          } else {
            this.serie = {
              ordered: true,
              posts: [],
              status: "draft"
            };
          }
        }));

        //parent scope asks to send current serie
        this.listeners.push($rootScope.$on('serie:validate', () => {
          this.serie.posts = this.serie.posts.map(post => {
            post.post_id = post.id;
            return post;
          });
          $rootScope.$emit('serie:post', this.serie);
        }));

        this.sendSerie = () => {
          this.serie.posts = this.serie.posts.map(post => {
            post.post_id = post.id;
            return post;
          });
          $rootScope.$emit('serie:post', this.serie);
        }

        this.switchStatus = () => {
          if (this.serie.status === "publish") {
            this.serie.status = "draft";
          } else {
            this.serie.status = "publish";
          }
          $rootScope.$emit("post:status:update", this.serie.status);
        };

        this.$onDestroy = () => {
          this.listeners.forEach(listener => {
            listener();
          });
        };

      };
    }
  ]
});