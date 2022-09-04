/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('locationArticleDisplay', ['$compile', 'postFactory', '$rootScope', '$sce', 'roleplayFactory', 'hotFactory', ($compile, postFactory, $rootScope, $sce, roleplayFactory, hotFactory) =>
  ({
    restrict: 'A',
    transclude: true,
    templateUrl: myLocalized.specPartials + 'locationArticleDisplay.html',
    scope: {
      locaSlug: '='
    },
    controller($scope, $element) {
      $scope.trust = string => $sce.trustAsHtml(string);


      $scope.villageLocaState = 'creation';

      $scope.articleInfo = {
        isDisplayed: false,
        info: {
          title: "",
          author: "",
          date: ""
        }
      };
      $scope.setState = state => {
        $scope.villageLocaState = state;
        return $scope.init();
      };

      $scope.getHot = function () {
        if (($rootScope.globalPostList !== undefined) && ($scope.postCollection !== undefined)) {
          return (() => {
            const result = [];
            for (var post of Array.from($rootScope.globalPostList)) {
              if (post.isHot) {
                if (post.lieu.slug === $scope.locaSlug) {
                  var jv;
                  if (post.type === "jeux_videos") {
                    for (jv of Array.from($scope.postCollection.jeux_video)) {
                      if (jv.ID === post.ID) {
                        jv.isHot = true;
                      }
                    }
                  }
                  if (post.type === "videos") {
                    for (jv of Array.from($scope.postCollection.videos)) {
                      if (jv.ID === post.ID) {
                        jv.isHot = true;
                      }
                    }
                  }
                  if (post.type === "photos") {
                    for (jv of Array.from($scope.postCollection.photos)) {
                      if (jv.ID === post.ID) {
                        jv.isHot = true;
                      }
                    }
                  }
                  if (post.type === "ecrits") {
                    for (jv of Array.from($scope.postCollection.ecrits)) {
                      if (jv.ID === post.ID) {
                        jv.isHot = true;
                      }
                    }
                  }
                  if (post.type === "images") {
                    result.push((() => {
                      const result1 = [];
                      for (jv of Array.from($scope.postCollection.images)) {
                        if (jv.ID === post.ID) {
                          result1.push(jv.isHot = true);
                        } else {
                          result1.push(undefined);
                        }
                      }
                      return result1;
                    })());
                  } else {
                    result.push(undefined);
                  }
                } else {
                  result.push(undefined);
                }
              } else {
                result.push(undefined);
              }
            }
            return result;
          })();

        } else {
          return setTimeout($scope.getHot, 100);
        }
      };
      $scope.months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

      $scope.managePostData = function (res) {
        let result;
        hensApp.log('manage');
        if (res.length > 0) {
          result = res;
          for (let post of Array.from(result)) {
            post.miniature = hensApp.setMiniature(post);
            post.tabDate = post.date.split('T')[0].split('-');
            post.year = post.tabDate[0];
            post.month = post.tabDate[1];
            post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
            post.day = post.tabDate[2];
            post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
          }
        } else {
          result = [];
        }
        return result;
      };


      $scope.setSeen = function (post) {
        post.isHot = false;
        return hotFactory.setPostSeen(post);
      };

      $scope.setRPSeen = function (roleplay) {
        roleplay.isHot = false;
        return hotFactory.setRPSeen(roleplay);
      };

      $scope.reload = () => location.reload();

      $scope.getLocaCollection = () =>
        postFactory.getPostsAtLocation($scope.locaSlug).then(function (res) {
          $scope.posts = res.data;
          return $scope.posts.forEach(post => {
            post.formatDate = moment(post.date).format('DD/MM/YYYY');
            post.miniType = hensApp.setMiniature({type: post.type});
            post.isHot = hotFactory.isPostHot(post);
            if ((post.type === 'images') || (post.type === 'photos')) {
              return post.chosenImage = post.images[0];
            } else if (['legende', 'article', 'recit'].indexOf(post.type) >= 0) {
              let start = 0;
              let end = -1;
              const l = post.excerpt.length;
              for (let i = 0, end1 = l, asc = 0 <= end1; asc ? i <= end1 : i >= end1; asc ? i++ : i--) {
                const letter = post.excerpt[i];
                if (letter === '<') {
                  start = i;
                  end = -1;
                }
                if (letter === '>') {
                  end = i;
                }
              }
              if ((end === -1) && (start !== 0)) {
                return post.formatExcerpt = post.excerpt.substr(0, start) + " [...]";
              } else {
                return post.formatExcerpt = post.excerpt + " [...]";
              }
            } else if (['jeux_videos'].indexOf(post.type) >= 0) {
              return post.chosenImage = post.image;
            }
          });
        });

      $scope.getLocaRoleplays = () => {
        roleplayFactory.getFromLocation($scope.locaSlug, {order: 'down'}).then(function (res) {
          $scope.roleplays = res.data;
          return $scope.roleplays.forEach(roleplay => {
            roleplay.participants = roleplay.members.map(member => roleplay.userList[member.user_id]);
            if (roleplay.messages.length > 0) {
              roleplay.last_message = moment(roleplay.messages[0].creationtime).format(hensApp.DATE_FORMAT);
              roleplay.last_post = moment(roleplay.messages[0].creationtime);
            }
            return roleplay.isHot = hotFactory.isRPHot(roleplay, $rootScope.currentUser.ID);
          });
        });
      }

      $scope.closeSelf = () => {
        $scope.$emit('setMapState:showArticles', false, $scope.locaSlug);
      }

      $scope.init = function () {
        if ($scope.villageLocaState === 'creation') {
          return $scope.getLocaCollection();
        } else if ($scope.villageLocaState === 'roleplay') {
          return $scope.getLocaRoleplays();
        }
      };

      return $scope.init();
    }
  })

]);
