/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('navBar', [
  'postFactory', 'userFactory', '$rootScope', '$sce', 'roleplayFactory', 'hotFactory',
  (postFactory, userFactory, $rootScope, $sce, roleplayFactory, hotFactory) => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'navBar.html',
    scope: {
      user: '='
    },

    controller($scope, $element) {
      /*
        GENERAL
      */
      $scope.subReady = false;
      $scope.loading = true;
      $scope.playerReady = false;
      $scope.annonceReady = false;
      $scope.userManager = userFactory;
      $scope.post = postFactory;
      $scope.roleplay = roleplayFactory;
      $scope.annoncesOpt = {
        villageColor: true,
        bottomBt: true,
        limit: 2
      };
      $scope.filters = [
        {
          type: 'new',
          name: 'Nouveauté'
        }, {
          type: 'top',
          name: 'Popularité'
        }
      ];
      $scope.selectedFilter = $scope.filters[0];
      $scope.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];
      $scope.locations = [
        ['village', 'falaise', 'forêt', 'marais'], ['village', 'mer', 'lac', 'prairie'],
        ['village', 'champs', 'bois', 'rivière'], ['village', 'montagne', 'collines', 'souterrains'],
      ];
      $scope.states = ['creation', 'roleplay'];
      $scope.stateTexts = {
        creation: 'Créations',
        roleplay: 'Jeu de Rôle'
      };
      $scope.months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre',
        'Décembre'
      ];
      $scope.finalPage = 100;
      $scope.currentPage = 1;
      $scope.navbarState = 'creation';

      $scope.checkLoading = function () {
        $scope.subReady = true;
        // if ($scope.navbarState === 'creation') {
        //   $scope.subReady = $scope.playerReady;
        // }
        // if ($scope.navbarState === 'roleplay') {
        //  $scope.subReady = $scope.annonceReady || !$rootScope.currentUser;
        // }
      };

      $scope.changeState = state => {
        $scope.navbarState = state;
        return $scope.init();
      };

      $scope.trust = string => $sce.trustAsHtml(string);

      $scope.toggleNavBar = function () {
        if ($element.hasClass('hidden')) {
          $element.removeClass('hidden');
          $scope.currentList = [];
          setTimeout(() => $scope.$apply(), 300);
          $scope.init();
        } else {
          $element.addClass('hidden');
          $scope.currentList = [];
          return setTimeout(() => $scope.$apply(), 300);
        }
      };

      $rootScope.$on('navbar:update', () => {
        $scope.init();
      });

      /*
        CREATION
      */
      $scope.switchCat = function (type) {
        let post;
        if (type === 'new') {
          $element.find('.navbar__cat-button').removeClass('active');
          $element.find('.navbar__cat-button--new').addClass('active');
          $scope.currentList = $scope.globalList;
        }
        if (type === 'liked') {
          $element.find('.navbar__cat-button').removeClass('active');
          $element.find('.navbar__cat-button--liked').addClass('active');
          if ($scope.user.meta.meta.likedContribs !== undefined) {
            $scope.contribList = $scope.user.meta.meta.likedContribs[0].split(':');
            $scope.currentList = [];
            for (post of Array.from($scope.globalList)) {
              for (let contribID of Array.from($scope.contribList)) {
                if (post.author.ID === parseInt(contribID)) {
                  $scope.currentList.push(post);
                }
              }
            }
          } else {
            $scope.currentList = [];
          }
        }
        if (type === 'fav') {
          $element.find('.navbar__cat-button').removeClass('active');
          $element.find('.navbar__cat-button--fav').addClass('active');
        }

        if (type === 'custom') {
          $element.find('.navbar__cat-button').removeClass('active');
          $element.find('.navbar__cat-button--custom').addClass('active');
        }
      };

      $scope.managePostData = function (res) {
        let posts = [];
        if (res.length > 0) {
          for (let post of res) {
            post.isHot = hotFactory.isPostHot(post);
            post.state = hotFactory.isPostSeen(post) ? 'seen' : 'new';
            post.tabDate = moment(post.date);
            post.year = post.tabDate.year();
            post.month = post.tabDate.month();
            post.monthLabel = hensApp.c.months[post.month];
            post.day = post.tabDate.date();
            post.formatType = hensApp.getFormatType(post);
            post.formDate = `Posté le ${post.day} ${post.monthLabel} ${post.year}`;
            posts.push(post);
          }
        }

        return posts;
      };

      $scope.setSeen = function (article) {
        article.state = 'seen';
        article.isHot = false;
        hotFactory.setPostSeen(article);
      };

      $scope.setRPSeen = function (roleplay) {
        roleplay.state = 'seen';
        roleplay.isHot = false;
        hotFactory.setRPSeen(roleplay);
      };

      $scope.displayPosts = function (res) {
        $scope.currentList = $scope.managePostData(res.data);
        $scope.globalList = $scope.currentList;

        //TODO: remove globalPostList... gonna take a while
        $rootScope.globalPostList = $scope.currentList;
        $scope.loading = false;
        $scope.checkLoading();
      };

      $scope.addPosts = function (res) {
        $scope.bottomLoading = false;
        if (res.length === 0) {
          $scope.finalPage = $scope.currentPage;
        }
        $scope.currentList = $scope.currentList.concat($scope.managePostData(res.data));
        $scope.globalList = $scope.currentList;
        $rootScope.globalPostList = $scope.currentList;
      };

      $scope.setSeenPosts = function () {
        $scope.seenPosts = hensApp.readCookie('Seen');
        if ($scope.seenPosts !== undefined) {
          $scope.seenPosts = $scope.seenPosts.split(':');
        } else {
          $scope.seenPosts = [];
        }
      };

      $scope.scrollCreationFn = function (e) {
        const t = e.currentTarget;
        if (!$scope.bottomLoading && (t.scrollHeight - (t.scrollTop + t.clientHeight)) <= 25) {
          $scope.getNewPostPage();
        }
      };


      $scope.search = { title: ""};
      $scope.searchTimeout = -1;
      $scope.$watch('search.title', (n, o) => {
        if (n !== o) {
          clearTimeout($scope.searchTimeout);
          $scope.searchTimeout = setTimeout(()=>{
            $scope.currentPage = 1;
            $scope.initCreation();
          }, 200);
        }
      });

      $scope.initCreation = () => {
        $scope.setSeenPosts();
        let searchOpts = {
          page: $scope.currentPage,
          sort: $scope.selectedFilter.type
        };
        if ($scope.search.title.length > 2) {
          searchOpts.title = $scope.search.title;
        }

        $scope.post
          .getPosts(searchOpts)
          .then($scope.displayPosts);

        setTimeout(() => {
          $element.find('.navbar__scroller').scroll($scope.scrollCreationFn);
        }, 100);

        if (!$scope.showcasedPost) {
          postFactory.getShowcasedPost().then(showcasedPost => {
            $scope.showcasedPost = showcasedPost.data;
            $scope.showcasedPost.formatType = TYPES[$scope.showcasedPost.type];
            $scope.showcasedPost.formatDate = hensApp.formatPhraseDate($scope.showcasedPost.post_date);
            console.log($scope.showcasedPost);
          });
        }
      };

      $scope.getNewPostPage = () => {
        $scope.currentPage = Math.min($scope.finalPage, $scope.currentPage + 1);
        $scope.bottomLoading = true;
        let searchOpts = {
          page: $scope.currentPage,
          sort: $scope.selectedFilter.type
        };
        if ($scope.search.title.length > 2) {
          searchOpts.title = $scope.search.title;
        }
        $scope.post.getPosts(searchOpts).then($scope.addPosts);
      };

      /**
       * TODO: move to a filter component
       * FILTER COMPONENT
       */
      $scope.startFilterBox = () => {
        $('.select-box').removeClass('hidden');
        $('.filter__placeholder').css('opacity', 0);
      };

      $scope.selectFilter = (filter, e) => {
        $('.select-box').addClass('hidden');
        $element.find('.navbar__scroller').scrollTop(0);
        $('.filter__placeholder').css('opacity', 1);
        $scope.selectedFilter = filter;
        $scope.currentPage = 1;
        $('.select-box').find('li').eq($(e.currentTarget).index()).prependTo('.select-box');
        $scope.initCreation();
      };

      /*
        ROLEPLAY
      */
      $scope.manageRoleplayData = function (list) {
        list.forEach(function (roleplay) {
          //TODO: order messages by last posted message (fun)
          if (roleplay.messages.length > 0) {
            roleplay.last_post = roleplay.messages.reverse()[0].creationtime;
          } else {
            roleplay.last_post = roleplay.creationtime;
          }
          if ($rootScope.currentUser) {
            roleplay.isHot = hotFactory.isRPHot(roleplay, $rootScope.currentUser.ID);
          }
          roleplay.state = hotFactory.isRPSeen(roleplay) ? 'seen' : 'new';
          roleplay.formatDate = moment(roleplay.last_post).format(hensApp.DATE_FORMAT);
          if (roleplay.type === 'instant') {
            roleplay.image =
              myLocalized.medias +
              `tchat/locations/${$scope.villages[roleplay.village]}/${$scope.locations[roleplay.village][roleplay.location]}_on.jpg`;
          } else {
            roleplay.image =
              myLocalized.medias +
              `tchat/locations/${$scope.villages[roleplay.village]}/${$scope.locations[roleplay.village][0]}_on.jpg`;
          }
        });
        list.sort((a, b) => {
          if (a.last_post > b.last_post) {
            return -1;
          } else {
            return 1;
          }
        });
        return list;
      };

      $scope.displayRoleplays = function (res) {
        $scope.roleplayList = $scope.manageRoleplayData(res.data);
        $scope.loading = false;
        $scope.checkLoading();
      };

      $scope.addRoleplays = function (res) {
        res = res.data;
        if (res.length === 0) {
          $scope.finalPage = $scope.currentPage;
        }
        return $scope.roleplayList = $scope.roleplayList.concat($scope.manageRoleplayData(res));
      };

      $scope.scrollRoleplayFn = function (e) {
        const t = e.currentTarget;
        if ((t.scrollHeight - (t.scrollTop + t.clientHeight)) <= 25) {
          return $scope.getNewRoleplayPage();
        }
      };

      $scope.initRoleplay = function () {
        $scope.roleplay.getAll({
          page: $scope.currentPage
        }).then($scope.displayRoleplays);
        setTimeout(() => {
          $element.find('.navbar__scroller').scroll($scope.scrollRoleplayFn);
        }, 100);
      };

      $scope.getNewRoleplayPage = function () {
        $scope.currentPage = Math.min($scope.finalPage, $scope.currentPage + 1);
        return $scope.roleplay.getAll({
          page: $scope.currentPage
        }).then($scope.addRoleplays);
      };

      //TODO FIX PLAYER NOT LOADING
      // $scope.$watch('playerReady', function (n, o) {
      //   if (n) {
      //     $scope.checkLoading();
      //   }
      // });
      //
      // $scope.$watch('annonceReady', function (n, o) {
      //   if (n != o) {
      //     $scope.checkLoading();
      //   }
      // });
      /*
        INIT
      */
      $scope.init = function () {
        $scope.subReady = false;
        $scope.loading = true;
        $scope.currentPage = 1;
        if ($scope.navbarState === 'creation') {
          $scope.initCreation();
        } else if ($scope.navbarState === 'roleplay') {
          $scope.initRoleplay();
        }
      };

      if ($rootScope.currentUser && window.innerWidth > 1200) {
        $scope.toggleNavBar();
      } else if ($element[0].classList.contains('full-page')) {
        $scope.currentList = [];
        $scope.toggleNavBar();
      } else {
        let w = $rootScope.$watch('currentUser', (n, o) => {
          if (n && n != o) {
            w();
            if (window.innerWidth > 1200) {
              $scope.toggleNavBar();
            }
          }
        });
      }
    }
  })

]);
