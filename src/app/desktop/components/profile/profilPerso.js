/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('profilPersonnage', [
    'postFactory', '$routeParams', 'userFactory', 'localeFactory', 'socket', '$rootScope',
    (postFactory, $routeParams, userFactory, localeFactory, socket, $rootScope) => ({
        restrict: 'A',
        templateUrl: myLocalized.specPartials + 'profilPerso.html',
        scope: {
            user: '=',
            personnage: '=',
            personnageList: '=',
            isMe: '=',
        },
        controller($scope, $element) {
            $scope.villages = hensApp.villages;
            $scope.$watch('personnageList', (n, o) => {
                $scope.filteredPersonnageList = $scope.personnageList.filter(p => p.prenom || $scope.isMe);
            });
            $scope.togglePouvoir = () => $scope.displayPouvoirDescr = !$scope.displayPouvoirDescr;

            const powerCard = $('.power-card');

            $scope.displayPerso = function () {
                $scope.editCustomPower = ($scope.personnage.options & 1) === 1;
                if ($scope.personnage.pouvoir_id != null) {
                    powerCard.css('background', `url('${myLocalized.medias}pouvoirs/${hensApp.villages[$scope.personnage.village]}/${$scope.personnage.pouvoir_id}.png')`);
                    powerCard.css('background-size', "100%");
                    powerCard.css('background-repeat', "no-repeat");
                    if (!$scope.editCustomPower) {
                        const url = `qcm/description/${hensApp.villages[$scope.personnage.village]}/${$scope.personnage.pouvoir_id}`;
                        localeFactory.JSON(url).then(res => $scope.pouvoirLabel = res.data);
                    } else {
                        $scope.pouvoirLabel = {
                            nom: "Pouvoir personalisé"
                        };
                    }
                } else {
                    powerCard.css('background', `url('${myLocalized.medias}pouvoirs/nopouvoir.jpg')`);
                    powerCard.css('background-size', "100%");
                    powerCard.css('background-repeat', "no-repeat");
                    $scope.pouvoirLabel = {nom: "Aucun pouvoir"};
                }
            };

            $scope.selectPersonnage = (personnage) => {
                $scope.personnage = personnage;
                $scope.personnageIndex = $scope.personnageList.findIndex(p => p.fid === personnage.fid);
                $rootScope.$broadcast('profil:selectPerso', personnage.fid);
                $scope.displayPerso();
            };

            $scope.toggleNovillage = (value) => {
                $scope.showNoVillage = value;
            };

            $scope.toggleEditFiche = () => {
                setTimeout(() => {
                    $rootScope.$broadcast('togglePersoEdit', $scope.personnage.fid);
                }, 100);
            };

            $rootScope.$on('perso-side-menu:set', (event, btn) => {
                $scope.state = btn;
            });

            $rootScope.$on('personnage:update', (event, personnage) => {
                $scope.personnage = personnage;
                let index = $scope.personnageList.findIndex(p => p.fid === personnage.fid);
                $scope.personnageList[index] = personnage;
                $scope.displayPerso();
            });


            $rootScope.$broadcast('perso-side-menu:request');

            $scope.getPerso = function () {
                if (!$scope.personnage) {
                    $scope.personnageExists = false;
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
                    // $scope.toggleEditFiche();
                    if (!$rootScope.currentUser.village) {
                        console.log('show village');
                        $scope.$broadcast('toggleNoVillage', true);
                    }
                    else {
                        console.log(" SET VILLAGE");
                        $scope.personnage.village = $rootScope.villages.indexOf($rootScope.currentUser.village);
                        $scope.persoPost = JSON.parse(JSON.stringify($scope.personnage));
                    }
                } else {
                    $scope.personnageExists = true;
                    if (($scope.personnage.options & 1) === 1) {
                        $scope.personnage.pouvoir_id = -1;
                        $scope.editCustomPower = true;
                    }
                    $scope.persoPost = JSON.parse(JSON.stringify($scope.personnage));
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
