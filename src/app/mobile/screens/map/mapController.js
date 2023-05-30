hensApp.controller('Map', [
    '$scope', '$rootScope', 'userFactory', 'localeFactory', 'eventsFactory',
    function ($scope, $rootScope, userFactory, localeFactory, eventsFactory) {
        $scope.userManager = userFactory;
        $rootScope.$emit('bottomNav:select', "Monde");

        $scope.$parent.info.isAppInit = false;
        $scope.$parent.info.isAppInit = true;

        $scope.uiElement = document.querySelector('.map__container');
        $scope.buttonsContainer = document.querySelector('.map__buttons-container');
        $scope.touchStartPosX = null;

        $scope.uiElement.addEventListener("touchstart", (e) => {
            $scope.touchStartPosX = e.touches[0].pageX;
            $scope.touchEndPosX = e.touches[0].pageX;
            $scope.buttonsContainer.classList.add('no-transition');
        });

        $scope.nextVillage;
        $scope.uiElement.addEventListener("touchmove", (e) => {
            $scope.touchEndPosX = e.touches[0].pageX;
            let diff = ($scope.touchEndPosX - $scope.touchStartPosX) / 1.5;
            let nextIndex = $scope.selectedIndex;
            if (diff > 0) {
                nextIndex--;
                if (nextIndex < 0) nextIndex = $scope.mapList.list.length - 1;
            }
            else if (diff < 0) {
                nextIndex++;
                if (nextIndex > $scope.mapList.list.length - 1) nextIndex = 0;
            }
            if ($scope.nextVillage) document.getElementById("mapButton" + $scope.nextVillage.label).style.removeProperty('--factor');
            $scope.nextVillage = $scope.mapList.list[nextIndex];
            document.getElementById("mapButton" + $scope.selectedZone.label).classList.add('no-transition');
            document.getElementById("mapButton" + $scope.nextVillage.label).classList.add('no-transition');
            let currentFactor = 0.75 + Math.max(0, Math.min((80 - Math.abs(diff)) / 80, 1)) * 0.25;
            let nextFactor = 0.75 + Math.max(0, Math.min((Math.abs(diff)) / 80, 1)) * 0.25;
            document.getElementById("mapButton" + $scope.selectedZone.label).style.setProperty("--factor", currentFactor.toString());
            document.getElementById("mapButton" + $scope.nextVillage.label).style.setProperty("--factor", nextFactor.toString());
        });

        $scope.uiElement.addEventListener("touchend", (e) => {
            $scope.buttonsContainer.classList.remove('no-transition');
            $scope.buttonsContainer.style.setProperty("--interactiveOffset", 0 + "px");
            document.querySelectorAll('.map-button').forEach(button => {
                button.style.removeProperty('--factor');
                button.classList.remove('no-transition');
            });

            if ($scope.touchEndPosX - 80 > $scope.touchStartPosX) {
                $scope.selectVillageMove(-1);
                $scope.$apply();
            } else if ($scope.touchEndPosX + 80 < $scope.touchStartPosX) {
                $scope.selectVillageMove(1);
                $scope.$apply();
            }
        });

        $scope.init = () => {
            localeFactory.JSON("mapList").then(function (res) {
                $scope.mapList = res.data;
                // $scope.mapList.list = hensApp.shuffleArray($scope.mapList.list);
                //set class string
                for (let index = 0; index < $scope.mapList.list.length; index++) {
                    const zone = $scope.mapList.list[index];
                    zone.class = `village-${$scope.mapList.list[index].label}`;
                    zone.url =
                        `map/${zone.village ? zone.village : zone.label}/${zone.type === 'village' ? zone.type : zone.label}`;
                }
                if ($rootScope.currentUser) {
                    let userVillage = $scope.mapList.list.find(village => village.label == $rootScope.currentUser.village);
                    if (userVillage == null) userVillage = $scope.mapList.list[0];
                    $scope.setSelectedVillage(userVillage);
                }
                else {
                    $scope.setSelectedVillage($scope.mapList.list[0]);
                }

            });
        };

        $scope.selectVillageMove = (diff) => {
            let newIndex = $scope.selectedIndex + diff;
            if (newIndex < 0) {
                newIndex = $scope.mapList.list.length - 1;
            }
            else if (newIndex >= $scope.mapList.list.length) {
                newIndex = 0;
            }
            $scope.setSelectedVillageIndex(newIndex)
        };

        $scope.setSelectedVillageIndex = (index) => {
            $scope.setSelectedVillage($scope.mapList.list[index]);
        };

        $scope.setSelectedVillage = (selectedZone) => {
            $scope.selectedZone = selectedZone;
            let selectedIndex = $scope.mapList.list.indexOf(selectedZone);
            $scope.selectedIndex = selectedIndex;
            let half = Math.floor($scope.mapList.list.length / 2);
            $scope.mapList.list.forEach((zone, index) => {
                let diff = index - selectedIndex;
                if (diff > half) {
                    diff -= $scope.mapList.list.length;
                } else if (diff < -half) {
                    diff += $scope.mapList.list.length;
                }

                zone.order = diff;
                zone.hidden = Math.abs(zone.order) >= 2;
                zone.selected = false;
            });
            selectedZone.selected = true;
        };

        $scope.init();
    }
]);
