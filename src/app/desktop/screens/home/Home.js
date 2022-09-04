/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('Home', [
  '$scope', '$http', '$location', '$routeParams', 'userFactory', '$compile', '$rootScope',
  function ($scope, $http, $location, $routeParams, userFactory, $compile, $rootScope) {
    $rootScope.showNoAccess = false;
    $scope.setCurrentPage('home');
    $scope.vid = document.querySelector("#video-container");
    $scope.$parent.info.isAppInit = false;
    $scope.playTeaser = function () {
      $("#video").find(".hover").hide();
      return $scope.vid.play();
    };

    $scope.scrollTo = function (amount) {
      $('#home-container').animate({scrollTop: amount - (($(window).height() - 80) / 2)}, Math.min(2000, 150 +
        (Math.abs($('#home-container').scrollTop() - amount) * 0.85)));
      return null;
    };

    $('#home-container').scroll(function (e) {
      if ((e.currentTarget.scrollTop > 500) && ($scope.vid.src !== "/medias/univers/teaser.mp4")) {
        return $scope.vid.src = "/medias/univers/teaser.mp4";
      }
    });

    $scope.userManager = userFactory;
    $scope.parallaxRatio = 0.25;
    $scope.parallaxInit = $(window).height() * $scope.parallaxRatio;
    //definition du lieu
    $scope.params.lieu = "Home";

    //parallax
    hensApp.parallax('#first-slide', '#home-container', $scope.parallaxInit + 20, $scope.parallaxRatio);
    hensApp.parallax('#scd-slide', '#home-container', $scope.parallaxInit + 20, $scope.parallaxRatio);
    hensApp.parallax('#third-slide', '#home-container', $scope.parallaxInit + 5, $scope.parallaxRatio);

    //setup background-size
    const sh = $(window).height();
    const sw = $(window).width();
    const bh = 1200;
    const fw = 1920;
    const fh = 1080;
    const fondRatio = 1920 / 1080;
    const toScroll = bh - sh;
    const toMoveParallax = toScroll * $scope.parallaxRatio;
    const finalFondH = sh + toMoveParallax;
    const finalFondW = finalFondH * fondRatio;
    const backgroundRatio = (finalFondW / sw) * 100;
    const bgRatioCss = `${backgroundRatio}%`;
    $('#first-slide').css('background-size', bgRatioCss);
    $('#scd-slide').css('background-size', bgRatioCss);
    $('#third-slide').css('background-size', bgRatioCss);

    //                              ,,
    //        db                    db
    //       ;MM:
    //      ,V^MM.    `7MMpMMMb.  `7MM  `7MMpMMMb.pMMMb.
    //     ,M  `MM      MM    MM    MM    MM    MM    MM
    //     AbmmmqMA     MM    MM    MM    MM    MM    MM
    //    A'     VML    MM    MM    MM    MM    MM    MM
    //  .AMA.   .AMMA..JMML  JMML..JMML..JMML  JMML  JMML.
    //
    //
    $scope.goutte = new Image(138, 154);
    $scope.gouttec = new Image(138, 154);
    $scope.goutte.src = myLocalized.medias + 'home/gouttes.png';
    $scope.gouttec.src = myLocalized.medias + 'home/gouttes-c.png';

    $scope.arcs = {};
    $scope.newArc = function (tag, thickness, radius, speed, stage, sw, sh, color) {
      $scope.arcs[tag] = new createjs.Shape();
      $scope.arcs[tag].graphics.setStrokeStyle(thickness, "round");
      $scope.arcs[tag].x = sw / 2;
      $scope.arcs[tag].y = sh / 2;
      $scope.arcs[tag].haSpeed = speed;
      $scope.arcs[tag].haRadius = radius;
      $scope.arcs[tag].haThickness = thickness;
      $scope.arcs[tag].arcList = [];
      $scope.arcs[tag].haColorizing = color;
      stage.addChild($scope.arcs[tag]);
      // $scope.arcs[tag].haRadius = radius
      let angle = 0;
      $scope.colorList = [
        [219, 47, 0], [1, 197, 195], [229, 140, 0], [159, 178, 0]
      ];

      return (() => {
        while (angle < (2 - (0.13 + (thickness / 700)))) {
          var scolor;
          if ((angle < (5 / 6)) || (angle > (1 + (5 / 6)))) {
            color = [255, 255, 255];
            scolor = $scope.colorList[Math.floor(Math.random() * 4)];
          } else {
            color = (scolor = $scope.colorList[Math.floor(Math.random() * 4)]);
          }
          let value = 0.04 + (Math.floor(Math.random() * 20) / 100);
          if ((value + angle) >= 2) {
            value = 2 - angle - (0.03 + (thickness / 700) + (Math.ceil(Math.random() * 10) / 500));
          }
          const start = (angle) * Math.PI;
          const end = Math.PI * (angle + value);
          $scope.arcs[tag].graphics.beginStroke(hensApp.rgba(color, 1)).arc(0, 0, radius, start, end).endStroke();
          $scope.arcs[tag].arcList.push({
            start,
            end,
            color: scolor
          });
          angle += value + 0.03 + (thickness / 700) + (Math.ceil(Math.random() * 10) / 500);
        }
      })();
    };

    //canvasInit
    setTimeout(function () {
      $scope.stage = new createjs.Stage("circle-canvas");
      $scope.stageDown = new createjs.Stage("lower-circle-canvas");
      let circleCanvas = $('#circle-canvas');
      $scope.sw = circleCanvas.width();
      $scope.sh = circleCanvas.height();
      let lowerCircleCanvas = $('#lower-circle-canvas');
      $scope.swLow = lowerCircleCanvas.width();
      $scope.shLow = lowerCircleCanvas.height();
      $scope.circle = new createjs.Shape();
      $scope.circle.graphics.f('#333').dc(0, 0, 130);
      $scope.circle.x = $scope.sw / 2;
      $scope.circle.y = $scope.sh / 2;
      $scope.stage.addChild($scope.circle);
      $scope.newArc('outer', 15, 160, 0.80, $scope.stage, $scope.sw, $scope.sh, true);
      $scope.newArc('middle', 21, 136, 0.95, $scope.stage, $scope.sw, $scope.sh, true);
      $scope.newArc('inner', 12, 114, 0.63, $scope.stage, $scope.sw, $scope.sh, true);
      $scope.newArc('outerLow', 4, 209, 0.48, $scope.stageDown, $scope.swLow, $scope.shLow, false);
      $scope.newArc('middleLow', 9, 199, 0.75, $scope.stageDown, $scope.swLow, $scope.shLow, false);
      $scope.newArc('innerLow', 6, 185, 0.6, $scope.stageDown, $scope.swLow, $scope.shLow, false);
      $('.choices').hover(function (t) {
        TweenLite.to($scope.arcs.outerLow, 5.5, {haSpeed: 1.7});
        TweenLite.to($scope.arcs.middleLow, 5.5, {haSpeed: 2.1});
        return TweenLite.to($scope.arcs.innerLow, 5.5, {haSpeed: 2.6});
      }, function (t) {
        TweenLite.to($scope.arcs.outerLow, 2, {haSpeed: .48});
        TweenLite.to($scope.arcs.middleLow, 2, {haSpeed: .75});
        return TweenLite.to($scope.arcs.innerLow, 2, {haSpeed: .6});
      });
      $scope.lowerG = new createjs.Bitmap($scope.goutte);
      $scope.lowerG.scaleX = 0.65;
      $scope.lowerG.scaleY = 0.65;
      $scope.lowerG.rotation = 345;
      $scope.lowerG.x = 32;
      $scope.lowerG.y = 230;
      $scope.upperG = new createjs.Bitmap($scope.gouttec);
      $scope.upperG.scaleX = 0.65;
      $scope.upperG.scaleY = 0.65;
      $scope.upperG.rotation = 162;
      $scope.upperG.x = 333;
      $scope.upperG.y = 128;
      $scope.stage.addChild($scope.upperG, $scope.lowerG);
      $scope.info.isAppInit = true;
      $scope.$apply();
      return $scope.animation = setInterval(function () {
        for (let key in $scope.arcs) {
          const value = $scope.arcs[key];
          value.graphics.clear();
          value.graphics.setStrokeStyle(value.haThickness, "round");
          for (let arc of Array.from(value.arcList)) {
            var alpha, color;
            const delta = value.haSpeed / (180 / Math.PI);
            let start = (arc.start = arc.start - delta);
            let end = (arc.end = arc.end - delta);
            if (start <= 0) {
              start = (arc.start = (Math.PI * 2) + start);
            }
            if (end <= 0) {
              end = (arc.end = (Math.PI * 2) + end);
            }
            if (value.haColorizing && ((start < ((Math.PI * 4) / 6)) || (start > (Math.PI + ((Math.PI * 4) / 6))))) {
              color = [255, 255, 255];
            } else {
              ({color} = arc);
            }

            const middle = start + (end / 2);
            if ((start < Math.PI) && value.haColorizing) {
              alpha = Math.min(1, 1.8 * Math.abs((start - ((Math.PI * 4.5) / 6))));
              if ((end > ((Math.PI * 4.5) / 6)) && (start < ((Math.PI * 4.5) / 6))) {
                alpha = 0;
              }
              if (end < ((Math.PI * 4.5) / 6)) {
                alpha = Math.min(1, 1.8 * Math.abs((end - ((Math.PI * 4.5) / 6))));
              }
            } else if ((start >= Math.PI) && value.haColorizing) {
              alpha = Math.min(1, 1.8 * Math.abs((start - Math.PI - ((Math.PI * 4.5) / 6))));
              if ((end > (Math.PI + ((Math.PI * 4.5) / 6))) && (start < (Math.PI + ((Math.PI * 4.5) / 6)))) {
                alpha = 0;
              }
              if ((end < (Math.PI + ((Math.PI * 4.5) / 6))) && (end > Math.PI)) {
                alpha = Math.min(1, 1.8 * Math.abs((end - Math.PI - ((Math.PI * 4.5) / 6))));
              }
            } else {
              alpha = 1;
            }
            value.graphics.beginStroke(hensApp.rgba(color, alpha)).arc(0, 0, value.haRadius, start, end).endStroke();
          }
        }

        $scope.stage.update();
        $scope.stageDown.update();
      }, 1000 / 20);
    }, 400);

    // POUR LEQUIPE DE HENS
    $scope.mainContribs = [1, 2, 38, 8, 10, 3, 4, 36, 12, 7, 5, 6, 9];
  }

]);
