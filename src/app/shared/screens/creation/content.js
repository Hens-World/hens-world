hensApp.controller('Content', [
  '$compile', '$scope', 'postFactory', 'userFactory', '$routeParams', '$rootScope', '$location',
  function ($compile, $scope, postFactory, userFactory, $routeParams, $rootScope, $location) {
    $rootScope.$emit('bottomNav:select', "Navbar");

    $scope.postManager = postFactory;
    $scope.$parent.info.isAppInit = false;
    $scope.userManager = userFactory;
    $scope.isInit = false;
    $scope.villages = hensApp.villages;
    //Like the current post function
    $scope.$watch('info.user', function (newValue, oldValue) {
      if ((newValue.meta !== undefined) && !$scope.$parent.info.isAppInit) {
        if (!$scope.isInit) {
          $scope.initBySeen();
        }
      } else if ($scope.info.user === 'guest') {
        $scope.initGuest();
      }
    });

    $scope.setBack = () => $rootScope.showNoAccess = true;

    $scope.displayPost = function (res) {
      let div, el, html;
      $scope.post = res.data;
      $scope.post.formattedZone =
        $scope.post.zone.slug.indexOf('village') === 0 || $scope.post.zone.slug.indexOf('quartier_') === 0 ? 'village' :
          $scope.post.zone.slug;

      $scope.post.formatDate = moment($scope.post.post_date).format(hensApp.DATE_FORMATS.SHORT);
      if (!$scope.post.authorList || $scope.post.authorList.length === 0) {
        $scope.post.authorList = [$scope.post.author];
      }
      //    $scope.seen()
      if (($scope.post.type === 'article') || ($scope.post.type === 'legende') || ($scope.post.type === 'recit')) {
        $('.article-container').remove();
        html =
          "<div ecrit-article post='post' is-fav='isFav' user='info.user' class='ecrit-container article-container'> </div>";
        el = $(html);
        div = $compile(el)($scope);
        $('.main-content-container').prepend(div);
      } else if ($scope.post.type === 'videos') {
        $('.article-container').remove();
        html =
          "<div video-article post='post' is-fav='isFav' user='info.user' class='video-article-container article-container'> </div>";
        el = $(html);
        div = $compile(el)($scope);
        $('.main-content-container').prepend(div);

      } else if (($scope.post.type === 'images') || ($scope.post.type === 'photos')) {
        $('.article-container').remove();
        html =
          "<div image-article post='post' is-fav='isFav' user='info.user' class='image-container article-container'> </div>";
        el = $(html);
        div = $compile(el)($scope);
        $('.main-content-container').prepend(div);

      } else if ($scope.post.type === "jeux_videos") {
        $('.article-container').remove();
        html =
          "<div game-article post='post' is-fav='isFav' user='info.user' class='game-container article-container'> </div>";
        el = $(html);
        div = $compile(el)($scope);
        $('.main-content-container').prepend(div);

      } else if ($scope.post.type === "musiques") {
        $('.article-container').remove();
        html =
          "<div musique-article post='post' is-fav='isFav' user='info.user' class='musique-container article-container'> </div>";
        el = $(html);
        div = $compile(el)($scope);
        $('.main-content-container').prepend(div);
      }

      //series mapping
      if ($scope.post.series.length > 0) {
        if ($routeParams.seriesid) {
          $scope.post.selectedSerie = $scope.post.series.find(serie=> serie.id === parseInt($routeParams.seriesid));
        }
        else {
          $scope.post.selectedSerie = $scope.post.series[0];
        }
      }

      if ($scope.post.selectedSerie) {
        if ($scope.post.selectedSerie.ordered) {
          $scope.post.selectedSerie.relationships = $scope.post.selectedSerie.relationships.sort((a,b)=>{
            if (a.post_order < b.post_order) return -1;
            else if (b.post_order <a.post_order) return 1;
            else return 0;
          });
        }
        else {
          $scope.post.selectedSerie.relationships = $scope.post.selectedSerie.relationships.sort((a,b)=>{
            let dateA = moment(a.created_at);
            let dateB = moment(a.created_at);
            if (dateA.isBefore(dateB)) return -1;
            else if (dateB.isBefore(dateA)) return 1;
            else return 0;
          });
        }
        let index = $scope.post.selectedSerie.relationships.findIndex(ship=>ship.post_id === $scope.post.ID);
        $scope.previousPost = $scope.post.selectedSerie.relationships[index -1];
        $scope.nextPost = $scope.post.selectedSerie.relationships[index +1];
      }


      $scope.$parent.info.isAppInit = true;
    };

    $scope.seen = function () {
      //reset all users meta
      $scope.check = res => hensApp.log(res.data.seenPosts);
      //isSeen part
      let list = hensApp.readCookie("Seen");
      if (list === undefined) {
        list = '';
      }
      list += `${$scope.post.ID}:`;
      hensApp.createCookie("Seen", list, 3000);
      $scope.seenPosts = '';
      $scope.userManager.updateMyMeta('seenPosts', $scope.seenPosts).then($scope.check);
    };

    //sets the article as seen
    $scope.initBySeen = function (res) {
      if ($scope.info.user !== undefined) {
        $scope.isAuth = true;
        $scope.isInit = true;
        let split = location.pathname.split('/');
        let post_type;
        if (split[1] === "profil") { // we're navigating a series
          post_type = split[5];
        }
        else {
          post_type = split[1];
        }
        $scope.postManager.getPostBySlug($routeParams.slug, post_type).then($scope.displayPost);
      }
    };

    $scope.initGuest = function () {
      let split = location.pathname.split('/');
      let post_type;
      if (split[1] === "profil") { // we're navigating a series
        post_type = split[5];
      }
      else {
        post_type = split[1];
      }
      $scope.postManager.getPostBySlug($routeParams.slug, post_type).then($scope.displayPost);
    };
    $scope.initBySeen();
  }
]);
