hensApp.directive('villageLocation', [
  '$compile', 'roleplayFactory', 'postFactory', '$rootScope', 'hotFactory',
  ($compile, roleplayFactory, postFactory, $rootScope, hotFactory) => ({
    restrict: 'E',
    templateUrl: myLocalized.partials + 'villageLoca.html',
    scope: {
      vData: '=',
      village: '='
    },
    controller($scope, $element) {
      $scope.title = $scope.vData.label;
      $element.css('left', $scope.vData.pos.x);
      $element.css('top', $scope.vData.pos.y);
      $element.css('width', $scope.vData.width);
      $element.css('height', $scope.vData.height);
      $scope.searched = false;


      $scope.onMouseOut = () => {
        $scope.vData.isOpen = false;
      }


      $scope.onMouseOver = () => {
        $scope.vData.isOpen = true;
        if (!$scope.searched) {
          roleplayFactory.getFromLocation($scope.vData.slug, {
            limit: 1,
            order: 'down'
          }).then(res => {
            $scope.searched = true;
            $scope.latestRP = res.data[0];
            if ($scope.latestRP) {
              $scope.latestRP.isHot = hotFactory.isRPHot($scope.latestRP, $rootScope.currentUser.ID);
            }
          });
          postFactory.getPostsAtLocation($scope.vData.slug, {
            limit: 1,
            order: 'down'
          }).then(res => {
            $scope.searched = true;
            $scope.latestCreation = res.data[0];
            if ($scope.latestCreation && !!$rootScope.currentUser) {
              $scope.latestCreation.isHot = hotFactory.isPostHot($scope.latestCreation, $rootScope.currentUser.ID);
            }
          });
        }
      };

      //mouse events
      $element[0].addEventListener('mouseenter', $scope.onMouseOver);
      $element[0].addEventListener('mouseleave', $scope.onMouseOut);


      /**
       * Valorise les différentes variable lié au temps pour le  village. (nuit/jour/saison).
       */
      $scope.setTime = function () {
        $scope.d = new Date();
        $scope.hour = $scope.d.getHours();
        $scope.day = $scope.d.getDate();
        $scope.month = $scope.d.getMonth() + 1;
        const d = $scope.day;
        const m = $scope.month;
        if (hensApp.isDateBetween([d, m], [1, 1], [20, 3]) || ((m === 12) && (d >= 21))) {
          $scope.season = "hiver";
        } else if (hensApp.isDateBetween([d, m], [21, 3], [20, 6])) {
          $scope.season = 'printemps';
        } else if (hensApp.isDateBetween([d, m], [21, 6], [20, 9])) {
          $scope.season = 'ete';
        } else if (hensApp.isDateBetween([d, m], [21, 9], [20, 12])) {
          $scope.season = 'automne';
        }

        if (($scope.hour >= 21) || ($scope.hour < 7)) {
          $scope.mapTime = "nuit";
        } else {
          $scope.mapTime = "jour";
        }
      };

      $scope.dateMatches = dateList => {
        let d;
        if (typeof dateList === 'string') {
          d = hensApp.parseDate(dateList);
          return (d[0] === $scope.day) && (d[1] === $scope.month);
        } else {
          return dateList.some(date => {
            if (typeof date === 'string') {
              d = hensApp.parseDate(date);
              return (d[0] === $scope.day) && (d[1] === $scope.month);
            } else {
              const d1 = hensApp.parseDate(date[0]);
              const d2 = hensApp.parseDate(date[1]);
              return hensApp.isDateBetween([$scope.day, $scope.month], d1, d2);
            }
          });
        }
      };

      $scope.setTime();
      $scope.hasEvent = $scope.vData.eventDates && $scope.dateMatches($scope.vData.eventDates);

    }
  })

]);
