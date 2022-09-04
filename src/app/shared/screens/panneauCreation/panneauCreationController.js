/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('panneauCreation', [
  '$scope', 'postFactory', '$compile', '$rootScope', '$location', 'userFactory', 'seriesFactory',
  function ($scope, postFactory, $compile, $rootScope, $location, userFactory, seriesFactory) {
    $rootScope.$emit('bottomNav:select', "Poster");

    $scope.listeners = [];

    //  `7MM"""YMM
    //    MM    `7
    //    MM   d `7MMpMMMb.
    //    MM""MM   MM    MM
    //    MM   Y   MM    MM
    //    MM       MM    MM
    //  .JMML.   .JMML  JMML.

    $scope.menuClick = function (btn) {
      $scope.showMobileMenu = false;
      if (btn.link === undefined) {
        $scope.state = btn.tag;
      } else {
        window.open(btn.tag, '_blank');
      }
    };

    $scope.toggleMobileMenu = () => {
      $scope.showMobileMenu = !$scope.showMobileMenu;
    };

    $scope.switchStatus = function () {
      if ($scope.status === "publish") {
        $scope.status = "draft";
      } else {
        $scope.status = "publish";
      }
      $rootScope.$emit('post:status:set', $scope.status);
    };

    $scope.sendValidateSerie = () => {
      $rootScope.$emit("serie:validate");
    };

    $scope.listeners.push($rootScope.$on('serie:post', (event, serie) => {
      serie.published = $scope.status === "publish";
      if (serie.id != null) {
        //TODO explicit fields
        seriesFactory.updateSerie(serie).then(() => {
          $scope.$broadcast('requestUpdateSeries');
          if (serie.published) {
            $rootScope.setAlert('success', `Votre série "${serie.title}" a bien été publiée !`)
            $scope.menuClick({tag: 'series'});
          } else {
            $rootScope.setAlert('success', `Votre série "${serie.title}" a bien été enregistrée !`)
            $scope.menuClick({tag: 'draft'});
          }
        }).catch($rootScope.handleError);
      } else {
        seriesFactory.createSerie(serie).then(() => {
          $scope.$broadcast('requestUpdateSeries');
          if (serie.published) {
            $scope.menuClick({tag: 'series'});
            $rootScope.setAlert('success', `Votre série "${serie.title}" a bien été publiée !`)
          } else {
            $scope.menuClick({tag: 'draft'});
            $rootScope.setAlert('success', `Votre série "${serie.title}" a bien été enregistrée !`)
          }
        }).catch($rootScope.handleError);
      }
    }));

    //also used by series
    $scope.listeners.push($rootScope.$on('post:status:update', (e, d) => {
      $scope.status = d;
    }));
    $scope.postPage = 1;

    $scope.createSerie = () => {
      $scope.status = "draft";
      $rootScope.$emit('startSerieCreation');
    };

    $scope.nextPostPage = (callback) => {
      if ($scope.state == 'published') {
        $scope.postPage++;
        $scope.postManager.getPosts({
          author: $rootScope.currentUser.ID,
          page: $scope.postPage
        }).then((res) => {
          callback(res.data.length);
          $scope.myposts = $scope.myposts.concat(res.data);
          for (let post of $scope.myposts) {
            post.tabDate = post.date.split('T')[0].split('-');
            post.year = post.tabDate[0];
            post.month = post.tabDate[1];
            post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
            post.day = post.tabDate[2];
            post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
          }
        });
      }
    };

    $scope.$on('media-select-start', (event, data) => {
      $scope.onMediaCallback = data;
    });

    $scope.callbackMedia = (media) => {
      $scope.onMediaCallback(media);
      $scope.onMediaCallback = null;
    };

    $scope.hideUploadModal = (e) => {

      if (e.target.id === e.currentTarget.id) {
        $scope.onMediaCallback = null;
      }

    };

    $scope.updatePosts = function (status, action) {
      $scope.getDrafts();
      $scope.getPosts();
      $rootScope.$emit('navbar:update');
      $scope.menuClick({tag: 'new'});
    };

    $scope.getComments = () => userFactory.getComments().then(function (result) {
      $scope.comments = result.data;
      for (let comment of Array.from($scope.comments)) {
        comment.formatDate = moment(comment.comment_date).format('YYYY/MM/DD  HH:mm');
      }
      return $scope.comments.sort(function (a, b) {
        const adate = moment(a.comment_date);
        const bdate = moment(b.comment_date);
        if (adate.isAfter(bdate)) {
          return -1;
        } else if (adate.isBefore(bdate)) {
          return 1;
        } else {
          return 0;
        }
      });
    });

    $scope.getPosts = () => {
      $scope.postPage = 1;
      $scope.postManager.getPosts({
        author: $rootScope.currentUser.ID,
        page: $scope.postPage
      }).then(function (res) {
        $scope.$parent.info.isAppInit = true;
        $scope.myposts = res.data;
        for (let post of Array.from($scope.myposts)) {
          post.tabDate = post.date.split('T')[0].split('-');
          post.year = post.tabDate[0];
          post.month = post.tabDate[1];
          post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
          post.day = post.tabDate[2];
          post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
        }
        $scope.getComments();
      });
    };

    $scope.getDrafts = () => postFactory.getPosts({
      status: 'draft',
      author: $rootScope.currentUser.ID
    }).then(res => {
      $scope.draftList = res.data;
      for (let post of Array.from($scope.draftList)) {
        post.tabDate = post.date.split('T')[0].split('-');
        post.year = post.tabDate[0];
        post.month = post.tabDate[1];
        post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
        post.day = post.tabDate[2];
        post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
      }
    });

    $scope.formatPost = function (obj) {
      let formatObj = {};
      for (let key in obj) {
        let value = obj[key];
        if (key === 'authors') {
          formatObj.auteurs = value.map(author => author.ID);
        } else if (key === "personnagesLies") {
          formatObj.personnages_lies = value.map(personnage => personnage.fid);
        } else if (key === 'lieu') {
          formatObj.locations = [value];
        } else {
          formatObj[key] = value;
        }
      }
      return formatObj;
    };

    $scope.isSending = false;
    $scope.updatePost = function (obj) {
      if ($scope.isSending) return;
      const post = $scope.formatPost(obj);
      $scope.isSending = true;
      return $scope.postManager.updatePost(post).then(res => {
        $rootScope.setAlert('success', `Votre création ${post.title} a bien été mise à jour !`);
        $scope.updatePosts(obj.status);
        $scope.isSending = false;
      }).catch((e) => {
        $scope.isSending = false;
        $rootScope.handleError(e);
      });
    };

    $scope.createPost = function (obj) {
      if ($scope.isSending) return;
      const post = $scope.formatPost(obj);
      $scope.isSending = true;
      return postFactory.newPost(post).then(function (res) {
        if (post.status == "publish") {
          $rootScope.setAlert('success', `Votre création ${post.title} a bien été postée !`);
        } else {
          $rootScope.setAlert('success', `Votre création ${post.title} a bien enregistrée en tant que brouillon cd!`);
        }
        $scope.updatePosts(obj.status);
        $scope.isSending = false;
      }).catch((e) => {
        $scope.isSending = false;
        $rootScope.handleError(e);
      });
    };

    $scope.deletePost = (post, status) => $rootScope.$emit('modal:set', {
      title: 'Supprimer une création',
      text: `Voulez vous vraiment supprimer la création \"${post.title}\" ?`,
      validation: () => {
        return $scope.postManager.deletePost(post.id).then(function (res) {
          $scope.updatePosts(status, 'delete');
          return $rootScope.setAlert('success', 'creation_delete');
        }).catch((e) => {
          $rootScope.setAlert('error', e.data.msg, 50);
        });
      }
    });

    $scope.defineCreaDirective = function (type, edit) {
      let add, html;
      if (edit) {
        add = "post=\"editPost\"";
      } else {
        add = "";
      }
      if (['legende', 'recit', 'article'].indexOf(type) >= 0) {
        html = `<div create-ecrit type=\"'${type}'\" ${add}  village='info.user.village'> </div>`;
      } else if ((type === "photos") || (type === "images")) {
        html = `<div create-images type=\"'${type}'\" ${add} village='info.user.village'> </div>`;
      } else if (type === "jeux_videos") {
        html = `<div create-game  type=\"'${type}'\" ${add} village='info.user.village'> </div>`;
      } else {
        html = `<div create-${type} type=\"'${type}'\" ${add} village='info.user.village'></div>`;
      }
      return html;
    };

    $scope.onPageScrollEnd = (callback) => {
      if ($scope.state === 'published') {
        $scope.nextPostPage(callback);
      }
    };

    $scope.startCreation = function (type, post) {
      let html;
      $scope.state = 'creating';
      const container = $('.create-post-container');
      $scope.editPost = post;
      if (post === undefined) {
        html = $scope.defineCreaDirective(type, false);
        const el = $(html);
        const div = $compile(el)($scope);
        container.empty();
        container.prepend(div);
      } else {
        postFactory.getPostBySlug($scope.editPost.slug, $scope.editPost.type).then((res) => {
          $scope.editPost = res.data;
          $scope.editPost.authors = $scope.editPost.authorList;
          html = $scope.defineCreaDirective(type, true);
          const el = $(html);
          const div = $compile(el)($scope);
          container.empty();
          container.prepend(div);
        });
      }
    };

    $scope.listeners.push($rootScope.$on('startSerieCreation', (event, serie) => {
      $scope.state = 'creatingSerie';
    }));

    $scope.configureWatchers = (rootScope, scope) => {
      rootScope.$emit('post:status:update', scope.post.status);
      rootScope.$emit('post:village:update', scope.post.village);
      rootScope.$emit('post:lieu:update', scope.post.location);

      let listeners = [];

      listeners.push(rootScope.$on('post:status:set', (e, value) => {
        scope.post.status = value;
      }));

      listeners.push(rootScope.$on('post:lieu:set', (e, value) => {
        if (!scope.post.location || value.id !== scope.post.location.id) {
          rootScope.$emit('post:lieu:update', value);
        }
        scope.post.location = value;
      }));

      listeners.push(rootScope.$on('post:village:set', (e, value) => {
        if (value.id !== scope.post.village.id) {
          rootScope.$emit('post:village:update', value);
        }
        scope.post.village = value;
      }));

      listeners.push(rootScope.$on('post:lieu:request', (e) => {
        rootScope.$emit('post:lieu:update', scope.post.location);
      }));

      listeners.push(rootScope.$on('post:village:request', (e) => {
        rootScope.$emit('post:village:update', scope.post.village);
      }));

      return listeners
    };

    //
    //                      ,,
    //  `7MMF'              db   mm
    //    MM                     MM
    //    MM  `7MMpMMMb.  `7MM mmMMmm
    //    MM    MM    MM    MM   MM
    //    MM    MM    MM    MM   MM
    //    MM    MM    MM    MM   MM
    //  .JMML..JMML  JMML..JMML. `Mbmo
    //
    //

    $scope.postManager = postFactory;
    $scope.$parent.info.isAppInit = false;
    $scope.notifTypeList = {
      error: 'anar',
      success: 'wilwar',
      info: 'ulmo',
      warning: 'sulimo'
    };
    $scope.notifType = 'info';

    $scope.typelist = [
      {
        "name": "Écrit",
        "type": "ecrit"
      }, {
        "name": "Image(s)",
        "type": "images"
      }, {
        "name": "Photographie(s)",
        "type": "photos"
      }, {
        "name": "Vidéo",
        "type": "videos"
      }, {
        "name": "Musique/Son",
        "type": "musiques"
      }, {
        "name": "Jeu vidéo",
        "type": "jeux_videos"
      }
    ];

    $scope.menuList = [
      {
        label: "Nouvelle création",
        tag: "new"
      }, {
        label: "Mes créations",
        tag: "published"
      }, {
        label: "Mes séries",
        tag: "series"
      }, {
        label: "Mes brouillons",
        tag: "draft"
      }, {
        label: "Bibliothéque media",
        tag: "bibliotheque-media",
      }, {
        label: "Commentaires",
        tag: "comments"
      }, {
        label: "Charte de création",
        tag: "charte"
      }
    ];

    if ($rootScope.currentUser) {
      $scope.getPosts();
      $scope.getDrafts();
    } else {
      $rootScope.$watch('currentUser', (n, o) => {
        if (n !== o && n) {
          $scope.getPosts();
          $scope.getDrafts();
        }
      });
    }

    //TODO remove debug
    $scope.menuClick({tag: 'new'});
    // $scope.menuClick({tag: 'series'});
    //$scope.menuClick({tag: 'creatingSerie'});

    $scope.$on('$destroy', ()=>{
      $scope.listeners.forEach(listener=>{
        listener();
      });
    });
  }

]);
