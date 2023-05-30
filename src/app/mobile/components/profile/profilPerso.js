hensApp.directive('profilPersonnage', [
    'postFactory', '$routeParams', 'userFactory', 'localeFactory', 'socket', '$rootScope', '$location',
    (postFactory, $routeParams, userFactory, localeFactory, socket, $rootScope, $location) => ({
        restrict: 'A',
        templateUrl: myLocalized.specPartials + 'profilPerso.html',
        scope: {
            user: '=',
            personnage: '=',
            personnageList: '=',
            isMe: '='
        },
        controller($scope, $element) {
            $scope.menuList = [
                {
                    label: "Fiche de personnage",
                    tag: "fiche"
                }, {
                    label: "Relations",
                    tag: "relations"
                }, {
                    label: "Aventures",
                    tag: "aventures"
                }, {
                    label: "Créations liées",
                    tag: "creations-liees"
                }
            ];
            $scope.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];

            $scope.displayPerso = function () {
                if ($scope.user.pouvoir) {
                    $('.power-card').css('background', `url('${myLocalized.medias}pouvoirs/${$scope.user.village}/${$scope.personnage.pouvoir_id}.png')`);
                    $('.power-card').css('background-size', "100%");
                    $('.power-card').css('background-repeat', "no-repeat");
                    if ($scope.personnage.pouvoir_id > 0) {
                        const url = `qcm/description/${$scope.user.village}/${$scope.user.pouvoir}`;
                        localeFactory.JSON(url).then(res => $scope.pouvoirLabel = res.data);
                    } else {
                        $scope.pouvoirLabel = {
                            nom: "Pouvoir personalisé"
                        };
                    }
                } else {
                    $('.power-card').css('background', `url('${myLocalized.medias}pouvoirs/nopouvoir.jpg')`);
                    $('.power-card').css('background-size', "100%");
                    $('.power-card').css('background-repeat', "no-repeat");
                }
            };

            $scope.toggleNovillage = (value) => {
                $scope.showNoVillage = value;
            };

            $scope.toggleEditFiche = () => {
                $rootScope.$broadcast('togglePersoEdit', $scope.personnage.fid);
            };

            $scope.togglePersoMenu = () => {
                $scope.persoMenuOpened = !$scope.persoMenuOpened;
            };

            $scope.closePersoMenu = () => {
                $scope.persoMenuOpened = false;
            };

            $rootScope.$on('perso-side-menu:set', (event, btn) => {
                $scope.state = btn;
            });

            $rootScope.$on('personnage:update', (event, personnage) => {
                $scope.personnage = personnage;
                let index = $scope.personnageList.findIndex(p => p.fid === personnage.fid);
                $scope.personnageList[index] = personnage;
            });

            $scope.selectPersonnage = (personnage) => {
                $scope.personnage = personnage;
                $scope.personnageIndex = $scope.personnageList.findIndex(p => p.fid === personnage.fid);
                $rootScope.$broadcast('profil:selectPerso', personnage.fid);
                $scope.displayPerso();
                $scope.openCharDropdown = false;
            };

            $rootScope.$broadcast('perso-side-menu:request');

            $scope.getPerso = function () {
                if (!$scope.personnage) {
                    $scope.personnage = {
                        prenom: '',
                        nom: '',
                        suffixe: '',
                        age: '',
                        village: '',
                        histoire: '',
                        caractere: '',
                        particularite: '',
                        pouvoir: ''
                    };
                    // $location.path('/choix-village');
                    if (!$rootScope.currentUser.village) {
                        $scope.toggleNovillage(true);
                    }
                } else {
                    if (($scope.personnage.options & 1) === 1) {
                        $scope.personnage.pouvoir_id = -1;
                        $scope.editCustomPower = true;
                    }
                    $scope.persoPost = structuredClone($scope.personnage);
                    $scope.persoPost.histoire = hensApp.parseContent($scope.persoPost.histoire);
                    $scope.persoPost.particularite = hensApp.parseContent($scope.persoPost.particularite);
                    $scope.persoPost.caractere = hensApp.parseContent($scope.persoPost.caractere);
                    $scope.persoPost.pouvoir = hensApp.parseContent($scope.persoPost.pouvoir);
                    $scope.displayPerso();
                }
            };
            $scope.getPerso();
        }
    })

]);
