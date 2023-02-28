hensApp.controller('ChoixVillage', [
    '$scope', 'userFactory', 'localeFactory', '$routeParams', '$location', 'accountFactory', '$rootScope', '$timeout',
    function ($scope, userFactory, localeFactory, $routeParams, $location, accountFactory, $rootScope, $timeout) {
        $scope.$parent.info.isAppInit = false;
        $scope.tempVillage = 'undefined';
        $scope.states = ["list", "detail", "confirm"];
        $scope.villageTarget = $routeParams.cid != null ? "character" : "account";

        //character or account
        $scope.characterIndex = $routeParams.cid != null ? parseInt($routeParams.cid) : 1;

        localeFactory.JSON('villageDescription').then(function (res) {
            $scope.villageDescriptions = res.data.villageList;

            if ($routeParams.village != null) {
                $scope.state = "confirm";
                let logo = document.querySelector(".choix-village__confirmation .logo");
                $scope.chosenVillage = $scope.villageDescriptions.find(desc => desc.slug === $routeParams.village);
                $scope.questionnaireLink = `questionnaire/${$scope.characterIndex}/${$scope.chosenVillage.slug}`;
                let path = $scope.chosenVillage.logo;
                let detailAnimation = lottie.loadAnimation({
                    container: logo, // the dom element that will contain the animation
                    renderer: 'svg',
                    loop: false,
                    autoplay: false,
                    path: path
                });
                setTimeout(() => {
                    detailAnimation.play();
                }, 1000);
            } else {
                $scope.state = "list";
            }

            $scope.$parent.info.isAppInit = true;
            if ($routeParams.village !== undefined) {
                $scope.tempVillage = $routeParams.village;
                $scope.listState = "hide";
                $scope.qcmState = "show";
                for (let village of Array.from($scope.villageDescriptions)) {
                    if (village.slug === $scope.tempVillage) {
                        $scope.chosenVillage = village;
                        $scope.chosenVillage.name =
                            $scope.chosenVillage.slug.charAt(0).toUpperCase() + $scope.chosenVillage.slug.slice(1);
                    }
                }
            }
            $timeout(() => {
                document.querySelectorAll('.village-logo').forEach(image => {
                    let village = image.getAttribute('village');
                    let path = $scope.villageDescriptions.find(desc => desc.slug === village).logo;
                    $scope.animations[village] = lottie.loadAnimation({
                        container: image, // the dom element that will contain the animation
                        renderer: 'svg',
                        loop: false,
                        autoplay: false,
                        path: path
                    });
                });
            });
        });

        $scope.setUserVillage = (villageDescription) => {
            $scope.tempVillage = villageDescription.slug;
            $scope.tempVillageDescription = villageDescription;
            $scope.state = 'detail';
            let logo = document.querySelector('.choix-village__detail .logo');
            if (logo.firstChild) {
                logo.firstChild.remove();
            }
            let path = $scope.villageDescriptions.find(desc => desc.slug === $scope.tempVillage).logo;
            let detailAnimation = lottie.loadAnimation({
                container: logo, // the dom element that will contain the animation
                renderer: 'svg',
                loop: false,
                autoplay: false,
                path: path
            });
            setTimeout(() => {
                detailAnimation.play();
            }, 1000);
        }

        $scope.returnToList = () => {
            $scope.state = 'list';
            setTimeout(() => {
                $scope.tempVillage = null;
                $scope.tempVillageDescription = null;
            }, 500);
        };

        $scope.validateNewVillage = function () {
            if ($scope.tempVillage !== 'undefined') {
                let villageIndex = $scope.villageDescriptions.findIndex(desc => desc.slug === $scope.tempVillage);
                userFactory.setVillage($rootScope.currentUser.ID, $scope.characterIndex, villageIndex).then((res) => {
                    if ($scope.villageTarget === "character") {
                        $location.path(`/choix-village/personnage/${$scope.characterIndex}/${$scope.tempVillage}`);
                    }
                    else {
                        $location.path(`/choix-village/${$scope.tempVillage}`);
                    }
                    setTimeout(function () {
                        // $scope.$parent.info.isAppInit = false;
                        window.location.reload();
                    }, 1);
                }).catch($rootScope.handleError);
            }
        };

        $scope.animations = {};
        $scope.HoverVillage = (village) => {
            $scope.animations[village].stop();
            $scope.animations[village].play();
        };

        $scope.OutVillage = (village) => {
        }

        $scope.$on('$viewContentLoaded', function (event) {

        });
    }

]);
