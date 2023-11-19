hensApp.controller('Map', [
    '$scope', '$rootScope', 'userFactory', 'localeFactory', 'eventsFactory',
    function ($scope, $rootScope, userFactory, localeFactory, eventsFactory) {
        $scope.userManager = userFactory;
        $rootScope.setCurrentPage("map");

        $scope.$parent.info.isAppInit = false;

        $scope.tchatLaunch = () => $rootScope.tchatInfo = {
            tchatOpen: true,
            channel: 0
        };

        eventsFactory.getCurrentEvent().then((data) => {
            $scope.currentEvent = data.data;
            if ($scope.currentEvent && $scope.currentEvent.slug === 'coupe-crushrun') {
                eventsFactory.coupeCrushrun.getVillageScores().then(data => {
                    $scope.crushrunScores = data.data;
                    let highestScore = 0;
                    let highestIndex = -1;
                    $scope.crushrunScores.forEach((score, index) => {
                        if (highestScore < score.score) {
                            highestScore = score.score;
                            highestIndex = index;
                        }
                    });

                    if (highestIndex >= 0) {
                        $scope.crushrunScores[highestIndex].king = true;
                    }
                });
            }
        }).catch($rootScope.handleError);

        $scope.getVillagerList = () => {
            userFactory.search({
                count_village: true
            }).then(result => {
                const villages_order = [...hensApp.villages, "neuter"];
                $scope.popList = result.data
                    .sort((a, b) => {
                        if (villages_order.indexOf(a.meta_value) < villages_order.indexOf(b.meta_value)) return -1;
                        if (villages_order.indexOf(a.meta_value) > villages_order.indexOf(b.meta_value)) return 1;
                        else return 0;
                    })
                    .map(line => {
                        return {
                            id: line.meta_value,
                            number: line.count
                        }
                    })
            }).catch($rootScope.handleError);
        };

        $scope.popList = [];
        $scope.hotCount = {
            anar: 0,
            sulimo: 0,
            ulmo: 0,
            wilwar: 0
        };

        $scope.getHot = function () {
            if ($rootScope.globalPostList !== undefined) {
                for (let post of Array.from($rootScope.globalPostList)) {
                    if (post.isHot && post.village) {
                        $scope.hotCount[post.village.slug]++;
                    }
                }
            } else {
                setTimeout($scope.getHot, 100);
            }
        }

        //def map src
        $scope.initMap = () => {
            $scope.loadStart = new Date();
            $scope.map = document.getElementById("map-global");
            $scope.map.autoplay = true;
            $scope.map.muted = true;
            $scope.map.loop = true;
            $scope.map.setAttribute("src", myLocalized.medias + 'map/global_map.mp4');
            $scope.map.load();
            $scope.vid = document.querySelector('#map-global');
            $scope.getVillagerList();
            var checkLoad = () => {
                const now = new Date();
                if ($scope.vid.readyState === 4) {
                    $scope.$parent.info.isAppInit = true;
                    $scope.$parent.$apply();
                    return $scope.getHot();
                } else if ((now - $scope.loadStart) > 4500) {
                    console.log('cancelled the video loading.');
                    $scope.$parent.info.isAppInit = true;
                    $scope.vid.pause();
                    $scope.$parent.$apply();
                    /*
                      @TODO: FIX THIS SHIT GODDAMIT
                      "new load request"
                    */
                    $scope.vid.src = "";
                    return $scope.vid.load();
                } else {
                    return setTimeout(checkLoad, 60);
                }
            };
            return checkLoad();
        };

        //
        //                 ,,                     ,,
        //  `7MM"""Yb.     db                   `7MM
        //    MM    `Yb.                          MM
        //    MM     `Mb `7MM  ,pP"Ybd `7MMpdMAo. MM   ,6"Yb.`7M'   `MF'
        //    MM      MM   MM  8I   `"   MM   `Wb MM  8)   MM  VA   ,V
        //    MM     ,MP   MM  `YMMMa.   MM    M8 MM   ,pm9MM   VA ,V
        //    MM    ,dP'   MM  L.   I8   MM   ,AP MM  8M   MM    VVV
        //  .JMMmmmdP'   .JMML.M9mmmP'   MMbmmd'.JMML.`Moo9^Yo.  ,V
        //                               MM                     ,V
        //                             .JMML.                OOb"
        $scope.updateMiniMap = function (map, e) {
            map = $(map);
            return map.css('background-position', `${-125 - (1.5 * e.offsetX)}px ${-70 - (1.3 * e.offsetY)}px`);
        };

        $scope.initBt = () => (() => {
            const result = [];
            const iterable = $(".map-button");
            for (let index = 0; index < iterable.length; index++) {
                var village, villageInfo;
                const button = iterable[index];
                const bt = $('.map-button').eq(index);
                const classList = bt.attr('class').split(' ');
                for (let style of Array.from(classList)) {
                    if (style.substring(0, 2) === "vi") {
                        village = style.replace('village-', '');
                    }
                }
                for (let info of Array.from($scope.mapList.list)) {
                    if (info.label === village) {
                        villageInfo = info;
                    }
                }
                bt.find('.geoloc').css('background', `url(${myLocalized.medias}/map/global-bt/${villageInfo.label}-geo.png)`);
                bt.find('.geoloc').css('background-size', "100% 100%");
                bt.find('.map-background').css('background-image', `url(${myLocalized.medias}map/mini/${villageInfo.label}-mini.jpg)`);
                bt.find('.map-background').css('background-position', `${-125}px ${-70}px`);
                bt.find('.map-background').css('background-repeat', "no-repeat");

                bt.find('.map-background').mousemove(function (e) {
                    return $scope.updateMiniMap(this, e);
                });
                // bt.find('.map-background').click((e)->
                //   window.location.replace("map/#{village}")
                // )
                result.push(bt.find('.outer-circle').click(function (e) {
                    $(this).parent().removeClass('noJq');
                    return setTimeout(() => {
                        return $(this).parent().addClass('noJq');
                    }, 1000);
                }));
            }
            return result;
        })();

        $scope.updateIconPos = () => (() => {
            const result = [];
            const iterable = $(".map-button");
            for (let index = 0; index < iterable.length; index++) {
                var village, villageInfo;
                const button = iterable[index];
                const bt = $('.map-button').eq(index);
                const classList = bt.attr('class').split(' ');
                for (let style of Array.from(classList)) {
                    if (style.substring(0, 2) === "vi") {
                        village = style.replace('village-', '');
                    }
                }
                for (let info of Array.from($scope.mapList.list)) {
                    if (info.label === village) {
                        villageInfo = info;
                    }
                }
                const mapWidth = parseInt($("#map-global").css('width').replace('px', ''));
                const mapHeight = parseInt($("#map-global").css('height').replace('px', ''));
                const x = (mapWidth * villageInfo.map.x) / 100;
                const y = (mapHeight * villageInfo.map.y) / 100;
                bt.css('left', `${x}px`);
                result.push(bt.css('top', `${y}px`));
            }
            return result;
        })();

        //global display
        $scope.updateDisplay = function () {
            $scope.updateMapHeight();
            return $scope.updateIconPos();
        };

        //update infos on map for correct display
        $scope.updateMapHeight = function () {
            let height = $("#map-global").css('height');
            height = height.replace("px", "");
            const mapWidth = (parseInt(height) * 16) / 9;
            $("#map-global").attr('width', mapWidth);
            $("#map-wrapper").attr('width', mapWidth);
            $("#map-wrapper").attr('height', height);
            const screenWidth = parseInt($(".map-container").css('width').replace('px', ''));
            const decal = (mapWidth - screenWidth) / 2;
            if (screenWidth < mapWidth) {
                $("#map-global").css('margin-left', `-${decal - 25}px`);
                return $(".map-button").css('margin-left', `-${decal - 25}px`);
            }
        };
        //app init
        $scope.startHere = () => localeFactory.JSON("mapList").then(function (res) {
            $scope.mapList = res.data;
            //set class string
            for (let index = 0; index < $scope.mapList.list.length; index++) {
                const zone = $scope.mapList.list[index];
                zone.class = `village-${$scope.mapList.list[index].label}`;
                zone.url =
                    `map/${zone.village ? zone.village : zone.label}/${zone.type === 'village' ? zone.type : zone.label}`;
            }
            $scope.initMap();

            eventsFactory.getShowcasedEvent().then((showcasedEvent) => {
                console.log("EYOWQYEOWYQEOY", showcasedEvent)
                $scope.event = showcasedEvent;
            });
            return $scope.updateDisplay();

        });

        $scope.startHere();
        $scope.$on('onRepeatLast', function (scope, element, attrs) {
            $scope.updateDisplay();
            return $scope.initBt();
        });
        //map resize
        return $scope.$watch(() => window.innerWidth, () => $scope.updateDisplay());
    }

]);
