angular.module('app').component('profileCompteContent', {
  templateUrl: myLocalized.partials + 'profileCompteContent.html',
  controllerAs: 'pContentCtrl',
  bindings: {
    user: '=',
  },
  controller: [
    '$scope', '$element', '$rootScope', 'postFactory', 'userFactory', '$routeParams', 'socket', 'seriesFactory',
    function ($scope, $element, $rootScope, postFactory, userFactory, $routeParams, socket, seriesFactory) {

      this.formatType = {
        post: "Création",
        serie: "Série de créations"
      }

      this.editInfo = {
        avatar: '',
        name: '',
        prenom: '',
        facebook: '',
        twitter: '',
        age: '',
        passions: '',
        website: '',
        description: '',
        favorites: [{}, {}, {}]
      };

      this.favoriteSearchChoices = [
        [
          {
            label: "Création",
            value: "post",
            selected: true
          }, {
          label: "Série",
          value: "serie",
        },
        ], [
          {
            label: "Création",
            value: "post",
            selected: true
          }, {
            label: "Série",
            value: "serie",
          },
        ], [
          {
            label: "Création",
            value: "post",
            selected: true
          }, {
            label: "Série",
            value: "serie",
          },
        ]
      ];

      this.deleteFavorite = (favorite) => {
        delete favorite.object;
      };

      this.onSearchUpdate = (choice, favorite) => {
        favorite.object_type = choice.value;
      }

      this.showEdit = false;
      this.isContrib = () => this.user && this.user.role === 'contributeur';

      this.toggleEdit = () => {
        this.showEdit = !this.showEdit;
        for (let key in this.editInfo) {
          let value = this.editInfo[key];
          if ([
            'age', 'passions', 'description', 'site', 'facebook', 'twitter', 'domaine', 'prenom', 'favorites'
          ].indexOf(key) > -1) {
            this.editInfo[key] = this.user.fiche[key];
          } else if ((this.user.first_name !== undefined) && (key === "name")) {
            this.editInfo[key] = this.user.first_name;
          } else {
            this.editInfo[key] = this.user[key];
          }
        }
      };

      this.onPronomUpdate = (choice) => {
        this.editInfo.pronom = choice.value;
        this.choices.forEach(choix => {
          choix.selected = choice.value === choix.value;
        });
      };

      //pronoms
      this.choices = [
        {
          label: "iel",
          value: 0,
        }, {
          label: "il",
          value: 1,
        }, {
          label: "elle",
          value: 2,
        },
      ];

      this.validateProfileEdit = function () {
        this.editInfo.description = hensApp.formatContent(this.editInfo.description);
        userFactory.createOrUpdateProfileFiche(this.user.ID, this.editInfo)
          .then((res) => {
            this.editProcess = false;
            this.closeEdit();
            this.updateOnEdit();
          }).catch($rootScope.handleError);

        if (this.user.role === "contributeur") {
          userFactory.saveFavorites(this.editInfo.favorites.map(favorite => favorite.object ? {
            object_id: favorite.object.id,
            object_type: favorite.object_type
          } : null)).then(() => {
            console.log('saved favorites')
          }).catch($rootScope.handleError);
        }
      };

      // toggle the Edit panel display
      this.closeEdit = function () {
        this.showEdit = false;
      };

      this.updateOnEdit = function () {
        this.user.pronom = this.editInfo.pronom;
        $rootScope.$broadcast('profilePronom:update', this.editInfo.pronom);
        if (this.editInfo.website && (this.editInfo.website.indexOf('http://') === -1) &&
          (this.editInfo.website.indexOf('https://') === -1)) {
          this.editInfo.website =
            `http://${this.editInfo.website.replace('http', '').replace('://', '').replace(':/', '')}`;
        }
        if (this.editInfo.avatar && this.editInfo.avatar.length > 0 && this.editInfo.avatar.indexOf('http') === 0) {
          this.user.avatar = this.editInfo.avatar;
        }
        this.getFiche();
      };

      this.getFiche = () => {
        this.hasFavorites = false;
        userFactory.getProfileFiche(this.user.ID).then((res) => {
          if (!res.data) {
            this.editInfo = {
              age: '',
              passions: '',
              description: '',
              site: '',
              facebook: '',
              twitter: '',
              domaine: '',
              favorites: [{}, {}, {}]
            };
          } else {
            this.user.fiche = res.data;
            this.user.fiche.pronom = this.user.pronom;
            this.choices.forEach((choix) => {
              choix.selected = choix.value === this.user.pronom;
            });
            if (this.user.fiche.website !== undefined) {
              if ((this.user.fiche.website === "Non précisé") || (this.user.fiche.website === "undefined") ||
                (this.user.fiche.website == null)) {
                this.user.fiche.website = "";
              }
              if ((this.user.fiche.website.indexOf('http://') === -1) &&
                (this.user.fiche.website.indexOf('https://') === -1) && (this.user.fiche.website.length > 0)) {
                this.user.fiche.website = `http://${this.user.fiche.website}`;
              }
            }
            if (this.isMe) {
              this.editInfo = hensApp.clone(this.user.fiche);
              this.editInfo.description = hensApp.parseContent(this.editInfo.description);
              this.editInfo.avatar = this.user.avatar;
            }
            for (let i = 0; i < 3; i++) {
              if (!this.user.fiche.favorites[i]) {
                this.user.fiche.favorites[i] = {object_type: "post"};
              } else {
                this.hasFavorites = true;
                if (this.user.fiche.favorites[i].post) {
                  this.user.fiche.favorites[i].object = this.user.fiche.favorites[i].post;
                  this.user.fiche.favorites[i].object.id = this.user.fiche.favorites[i].post.ID;
                  this.user.fiche.favorites[i].object.title = this.user.fiche.favorites[i].post.post_title;
                  this.user.fiche.favorites[i].object.miniature =
                    this.user.fiche.favorites[i].post.meta.find(meta => meta.meta_key === "miniature").meta_value;
                  this.user.fiche.favorites[i].object.detail =
                    hensApp.formatPhraseDate(this.user.fiche.favorites[i].object.post_date);
                }
                if (this.user.fiche.favorites[i].serie) {
                  this.user.fiche.favorites[i].object = this.user.fiche.favorites[i].serie;
                  this.user.fiche.favorites[i].object.detail =
                    this.user.fiche.favorites[i].object.relationships.length + " créations";
                }
                this.favoriteSearchChoices[i].forEach(choice => choice.selected = false);
                this.favoriteSearchChoices[i].find(choice => {
                  return choice.value == this.user.fiche.favorites[i].object_type
                }).selected = true;
              }
            }
            setTimeout(() => {
              socket.emit('isOnline', $routeParams.id);
            }, 100);
          }
          $element.find('.mail-show').hide();
          $element.find('.mail').click(function (e) {
            if ($element.find('.mail-show').is(':visible')) {
              $element.find('.mail-show').hide();
            } else {
              $element.find('.mail-show').show();
              $element.find('.mail-show').select();
            }
          });
        });
      };

      this.toggleLikeList = (e) => {
        this.likePage = 1;
        e.currentTarget.classList.add('hiding');
        userFactory.getLikes($routeParams.id, {page: this.likePage}).then(this.displayLikedPosts);
      };

      this.nextLikePage = (callback) => {
        this.likePage++;
        userFactory.getLikes($routeParams.id, {page: this.likePage}).then((res) => {
          callback(res.data.length);
          this.displayLikedPosts(res, true);
        });
      };

      this.postPage = 1;
      this.nextPostPage = (callback) => {
        this.postPage++;
        postFactory.getPosts({
          author: $routeParams.id,
          page: this.postPage
        }).then((res) => {
          callback(res.data.length);
          this.displayContribPosts(res, true);
        }).catch((e) => {
          $rootScope.handleError();
          callback(false);
        });
      };

      this.displayLikedPosts = (res, keepOld = false) => {
        if (keepOld) {
          this.likedPosts = this.likedPosts.concat(res.data);
        } else {
          this.likedPosts = res.data;
        }
        for (let postIndex = 0; postIndex < this.likedPosts.length; postIndex++) {
          const post = this.likedPosts[postIndex];
          post.tabDate = post.date.split('T')[0].split('-');
          post.year = post.tabDate[0];
          post.month = post.tabDate[1];
          post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
          post.day = post.tabDate[2];
          post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
        }
        $scope.$parent.$parent.info.isAppInit = true;
      };

      //displays the posts made by this contrib
      this.displayContribPosts = (res, keepOld) => {
        $scope.$parent.$parent.info.isAppInit = true;
        if (keepOld) {
          this.contribPosts = this.contribPosts.concat(res.data);
        } else {
          this.contribPosts = res.data;
        }
        for (let postIndex = 0; postIndex < this.contribPosts.length; postIndex++) {
          const post = this.contribPosts[postIndex];
          post.tabDate = post.date.split('T')[0].split('-');
          post.year = post.tabDate[0];
          post.month = post.tabDate[1];
          post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
          post.day = post.tabDate[2];
          post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
        }
        this.updateSeriesPost();
        return true;
      };

      this.init = () => {
        if (this.hasInit) return;
        this.hasInit = true;
        if (this.isContrib()) {
          postFactory.getPosts({
            author: $routeParams.id,
          }).then(this.displayContribPosts).then(() => {
            seriesFactory.getSeriesByUserId(parseInt($routeParams.id)).then(this.displayContribSeries).catch($rootScope.handleError);
          }).catch($rootScope.handleError);

        }
        this.getFiche();
      };

      this.displayContribSeries = (series) => {
        this.contribSeries = series.data.map(serie => {
          serie.creationTypes = [...new Set(serie.posts.map(post => TYPES[post.post_type]))].join(', ');
          return serie;
        });

        this.updateSeriesPost();
      };

      this.updateSeriesPost = () => {
        if (this.contribPosts && this.contribSeries) {
          this.contribPosts.forEach(post => {
            let serie = this.contribSeries.find(serie => !!serie.posts.find(seriePost => seriePost.ID === post.id));
            if (serie) {
              post.serie = serie;
            }
          });
        }
      }

      this.$onInit = () => {
        $scope.$on('toggleProfileEdit', () => {
          this.toggleEdit();
        });

        $rootScope.$on('compte-side-menu:set', (event, state) => {
          $scope.state = state;
        });
        $scope.state = {
          label: "Résumé du profil",
          tag: "resume"
        };

        let waitUser = () => {
          if (this.user) {
            this.init();
          } else {
            requestAnimationFrame(waitUser);
          }
        };
        waitUser();
        userFactory.getLikes($routeParams.id, {pageSize: 3}).then(this.displayLikedPosts);
      }
    }
  ]
});