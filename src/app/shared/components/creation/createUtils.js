/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

//                                                 ,,                     
//  `7MMF'                                  mm     db                     
//    MM                                    MM                            
//    MM         ,pW"Wq.   ,p6"bo   ,6"Yb.mmMMmm `7MM  ,pW"Wq.`7MMpMMMb.  
//    MM        6W'   `Wb 6M'  OO  8)   MM  MM     MM 6W'   `Wb MM    MM  
//    MM      , 8M     M8 8M        ,pm9MM  MM     MM 8M     M8 MM    MM  
//    MM     ,M YA.   ,A9 YM.    , 8M   MM  MM     MM YA.   ,A9 MM    MM  
//  .JMMmmmmMMM  `Ybmd9'   YMbmd'  `Moo9^Yo.`Mbmo.JMML.`Ybmd9'.JMML  JMML.

hensApp.directive("newPostLocation", [
  'localeFactory', 'postFactory', '$rootScope', (localeFactory, postFactory, $rootScope) => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'newPostLocation.html',
    controller($scope, $element) {

      $scope.locaSearch = {
        village: '',
      };

      $scope.locaTypeSearch = {
        name: ''
      };

      $scope.setSearchVillage = (village, callback) => {
        if (village !== $scope.locaSearch.village && village) {
          $scope.locaSearch.village = village;
        } else {
          $scope.locaSearch.village = null;
          $scope.currentList = null;
        }
        if ($scope.locaSearch.village != void 0 && $scope.locaSearch.village.trim().length > 0) {
          postFactory.searchLocations({
            village: village
          }).then(res => {
            $scope.zoneList = res.data;
            const zoneIds = $scope.zoneList.map(zone => zone.id);
            postFactory.searchLocations({
              parentList: zoneIds
            }).then(res => {
              $scope.locaList = res.data;
              $scope.currentList = res.data;
              if (callback) {
                callback();
              }
            });
          });
        }
      };

      $scope.filterZone = (zone) => {
        if ($scope.activeZone && zone.id === $scope.activeZone) {
          $scope.activeZone = null;
        } else {
          $scope.activeZone = zone.id;
        }

        $scope.currentList =
          $scope.locaList.filter(loca => $scope.activeZone === loca.zone.id || $scope.activeZone == void 0);
      };

      $scope.chooseLoca = function (loca) {
        if (!$scope.lieu || loca.id != $scope.lieu.id) {
          $rootScope.$emit('post:lieu:set', loca);
        }
        $scope.lieu = loca;
      };

      $rootScope.$on('post:lieu:update', (e, d) => {
        $scope.lieu = d;
      });

      $rootScope.$on('post:village:update', (e, d) => {
        $scope.setSearchVillage(d.slug, () => {
          if ($scope.lieu) {
            const loca = $scope.locaList.find(lieu => lieu.slug === $scope.lieu.slug);
            $scope.chooseLoca(loca);
          }
        });
        $scope.postVillage = d;
      });

      $rootScope.$emit('post:lieu:request');
      $rootScope.$emit('post:village:request');
    }
  })

]);

//                                  ,,
//        db                 mm   `7MM                        
//       ;MM:                MM     MM                        
//      ,V^MM.  `7MM  `7MM mmMMmm   MMpMMMb.  ,pW"Wq.`7Mb,od8 
//     ,M  `MM    MM    MM   MM     MM    MM 6W'   `Wb MM' "' 
//     AbmmmqMA   MM    MM   MM     MM    MM 8M     M8 MM     
//    A'     VML  MM    MM   MM     MM    MM YA.   ,A9 MM     
//  .AMA.   .AMMA.`Mbod"YML. `Mbmo.JMML  JMML.`Ybmd9'.JMML.   

hensApp.directive("newPostAuthors", [
  'userFactory', userFactory => ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'newPostAuthors.html',
    scope: {
      authors: '=',
      allRoles: '=',
      fastSearch: '='
    },
    controller: [
      '$scope', '$element', '$rootScope', function ($scope, $element, $rootScope) {
        // FUNCTIONS----
        $scope.startNewAuthorSearch = () => $scope.isSearchingAuthor = true;

        $scope.validateAuthor = function (authorToAdd) {
          let author;
          $scope.authorNameFilter = "";
          $scope.isSearchingAuthor = false;
          for (let index = 0; index < $scope.authorList.length; index++) {
            author = $scope.authorList[index];
            if (author.ID === authorToAdd.ID) {
              $scope.authorList.splice(index, 1);
              break;
            }
          }
          $scope.searchAuthorList = [];
          for (author of Array.from($scope.authors)) {
            if (author.ID === authorToAdd.ID) {
              return false;
            }
          }

          return $scope.authors.push(authorToAdd);
        };

        $scope.removeAuthor = function (authorToDel) {
          for (let index = 0; index < $scope.authors.length; index++) {
            const author = $scope.authors[index];
            if ((author.ID === authorToDel.ID) && (parseInt(author.ID) !== $rootScope.currentUser.ID)) {
              $scope.authors.splice(index, 1);
              break;
            }
          }

          return $scope.authorList.push(authorToDel);
        };

        //INIT ----
        $scope.userManager = userFactory;
        if (!$scope.authors) {
          $scope.authors = [];
          $scope.userManager.getMe().then(function (res) {
            res = res.data;
            if (res.avatar === undefined) {
              res.avatar = [myLocalized.medias + 'profil/no-avatar.png'];
            }
            return $scope.authors.unshift(res);
          });

        }

        $scope.$watch('authorNameFilter', function (n, o) {
          if ((n !== o) && (n.length > 2)) {
            let opts = {
              search: $scope.authorNameFilter
            };
            if (!$scope.allRoles) {
              opts.role = 'contributeur';
            }
            $scope.userManager.getUserList(opts).catch($rootScope.handleError).then(function (res) {
              $scope.authorList = res.data;
              $scope.searchAuthorList = [];
              for (let author of Array.from($scope.authorList)) {
                let f = n.toLowerCase();
                let fail = false;
                let tan = author.display_name.toLowerCase(); // temporary author name
                for (var letter of Array.from(f)) {
                  letter = letter.toLowerCase();
                  if (tan.indexOf(letter) === -1) {
                    fail = true;
                  }
                  tan = tan.slice(0, tan.indexOf(letter)) + tan.slice(tan.indexOf(letter) + 1, tan.length);
                }
                if (!fail) {
                  author.selecName = [];
                  f = n.toLowerCase();
                  for (letter of Array.from(author.display_name)) {
                    letter = letter.toLowerCase();
                    if (f.indexOf(letter) > -1) {
                      author.selecName.push({
                        letter,
                        selected: true
                      });
                      f = f.slice(0, f.indexOf(letter)) + f.slice(f.indexOf(letter) + 1, f.length);
                    } else {
                      author.selecName.push({
                        letter,
                        selected: false
                      });
                    }
                  }
                  $scope.searchAuthorList.push(author)
                }
              }
            });
          } else {
            $scope.searchAuthorList = [];
          }
        });
        if ($scope.fastSearch) {
          $scope.hideDescr = true;
          $scope.absoluteList = true;
          $scope.startNewAuthorSearch();
        }
      }
    ]

  })

]);

