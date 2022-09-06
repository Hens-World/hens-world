angular.module('app').component('profilePersoContent', {
    templateUrl: myLocalized.partials + 'profilePersoContent.html',
    controllerAs: 'pContentCtrl',
    bindings: {
        user: '=',
        personnage: '=',
        personnageList: '=',
        personnageIndex: '=',
        isMe: "=",
        persoPost: '=',
        editCustomPower: '=',
    },
    controller: [
        '$scope', '$element', '$rootScope', 'postFactory', 'userFactory', '$routeParams', 'socket', 'roleplayFactory',
        function ($scope, $element, $rootScope, postFactory, userFactory, $routeParams, socket, roleplayFactory) {
            this.showNoVillage = false;

            this.$onChanges = (changes) => {
                if (changes.user) $scope.user = this.user;
                if (changes.personnage) $scope.personnage = this.personnage;
                if (changes.persoPost) $scope.persoPost = this.persoPost;
                if (changes.isMe) $scope.isMe = this.isMe;
                if (changes.editCustomPower) $scope.editCustomPower = this.editCustomPower;
            };

            $scope.showPerso = false;
            $scope.isCreating = false;
            $scope.isEditingChar = false;
            $scope.newRelation = {};
            $scope.state = null;

            this.$onInit = () => {
                $scope.user = this.user;
                $scope.personnage = this.personnage;
                $scope.isMe = this.isMe;
                $scope.persoPost = this.persoPost;
                $scope.editCustomPower = this.editCustomPower;
                $scope.initRelation();

                if (this.personnageList.length === 0 && this.isMe) {
                    if ($rootScope.currentUser.village == null) {
                        this.showNoVillage = true;
                    } else {
                        $scope.toggleEditFiche();
                    }
                }

                if (this.personnage && this.personnage.char_index !== 1 && !this.personnage.prenom) {
                    $scope.toggleEditFiche();
                }

                $scope.initParticipations();

                if ($scope.persoPost) {
                    $scope.initPostLies();
                }
            };

            $scope.initParticipations = () => {
                roleplayFactory.getPersonnageRps($scope.user.ID).then((res) => {
                    $scope.participationList = res.data.map(rp => {
                        if (rp.location > 4) rp.location = 0;
                        return rp;
                    })
                }).catch($rootScope.handleError);
            };

            $scope.initPostLies = () => {
                userFactory.getCharacterCreations($scope.user.ID, $scope.persoPost.fid).then((res) => {
                    $scope.postLies = res.data.map((post) => {
                        post.tabDate = post.date.split('T')[0].split('-');
                        post.year = post.tabDate[0];
                        post.month = post.tabDate[1];
                        post.monthLabel = hensApp.c.months[parseInt(post.month) - 1];
                        post.day = post.tabDate[2];
                        post.formDate = `Le ${post.day} ${post.monthLabel} ${post.year}`;
                        return post;
                    });
                }).catch($rootScope.handleError);
            };

            $rootScope.$on('profil:selectPerso', (event, fid) => {
                this.personnage = this.personnageList.find(p => p.fid === fid);
                $scope.personnage = this.personnage;
                if (!this.personnage.prenom) $scope.toggleEditFiche();
                $scope.persoPost = JSON.parse(JSON.stringify(this.personnage));
                if ($scope.persoPost.char_index == 1) {
                    $scope.persoPost.village = $scope.villages.indexOf($rootScope.currentUser.village);
                }
                $scope.initRelation();
                $scope.initPostLies();
                $scope.initParticipations();
            });

            $rootScope.$on('togglePersoEdit', (event, fid) => {
                $scope.toggleEditFiche();
            });

            $scope.toggleEditFiche = function () {
                $scope.isEditingChar = true;
                $scope.showPerso = true;
            };

            $scope.$on('toggleNoVillage', (env, value) => {
                this.showNoVillage = value;
            })

            $scope.cancelEditPerso = function () {
                $scope.isEditingChar = false;
                $scope.persoPost = JSON.parse(JSON.stringify($scope.personnage));
                $scope.persoPost.histoire = hensApp.parseContent($scope.persoPost.histoire);
                $scope.persoPost.particularite = hensApp.parseContent($scope.persoPost.particularite);
                $scope.persoPost.caractere = hensApp.parseContent($scope.persoPost.caractere);
                $scope.persoPost.pouvoir = hensApp.parseContent($scope.persoPost.pouvoir);
            };

            $scope.editRelation = function (relation) {
                $scope.isCreating = true;
                $scope.newRelation = relation;
                $scope.newRelation.name = "";
                $scope.newRelation.char = relation.personnage;
            };

            $scope.startCreate = function () {
                $scope.isCreating = true;
                $scope.newRelation = {
                    name: "",
                    title: "",
                    description: ""
                };
            };

            $scope.selectPerso = function (perso) {
                $scope.newRelation.name = "";
                return $scope.newRelation.char = perso;
            };

            $scope.villages = hensApp.villages;
            $scope.locations = [
                ['village', 'falaise', 'forêt', 'marais'], ['village', 'mer', 'lac', 'prairie'],
                ['village', 'champs', 'bois', 'rivière'], ['village', 'montagne', 'collines', 'souterrains'],
            ];
            $scope.hideFiche = function () {
                $scope.showPerso = false;
                $scope.isEditingChar = false;
                if ($scope.persoPost) {
                    return $scope.persoPost = JSON.parse(JSON.stringify($scope.personnage));
                }
            };

            $scope.showFiche = () => $scope.showPerso = true;

            $scope.sendRelation = function () {
                let obj;
                if (!$scope.newRelation.rid) {
                    obj = {
                        from_id: $scope.user.ID,
                        to_id: $scope.newRelation.char.owner_id,
                        from_char: $scope.newRelation.char.char_index,
                        to_char: $scope.personnage.char_index,
                        title: $scope.newRelation.title,
                        description: $scope.newRelation.description
                    };
                    userFactory.createRelation($rootScope.currentUser.ID, $scope.personnage.char_index, obj).then(function (res) {
                        if (!res.error) {
                            $rootScope.setAlert('success', 'relation_create', 50, res.title);
                            return $scope.initRelation();
                        } else {
                            return $rootScope.setAlert('error', res.msg, 50, res.title);
                        }
                    });

                    $scope.newRelation = {};
                } else {
                    obj = {
                        rid: $scope.newRelation.rid,
                        from_id: $scope.user.ID,
                        to_id: $scope.newRelation.char.owner_id,
                        from_char: $scope.newRelation.char.char_index,
                        to_char: $scope.personnage.char_index,
                        title: $scope.newRelation.title,
                        description: $scope.newRelation.description
                    };
                    userFactory.editRelation($rootScope.currentUser.ID, $scope.personnage.char_index, $scope.newRelation.rid, obj)
                        .then(res => {
                            if (!res.error) {
                                $rootScope.setAlert('success', 'relation_edit', 50, res.title);
                                return $scope.initRelation();
                            } else {
                                return $rootScope.setAlert('error', res.msg, 50, res.title);
                            }
                        });
                }

                $scope.newRelation = {
                    rid: 0
                };
                return $scope.isCreating = false;
            };

            $scope.sugggestionList = [];

            $scope.$watchCollection("newRelation", function (n, o) {
                if (n) {
                    if (n.name !== o.name) {
                        if (n.name && (n.name.trim().length > 1)) {
                            userFactory.searchCharacters(n.name).then(data => {
                                console.log(data);
                                $scope.suggestionList = data.data;
                            });
                        } else {
                            $scope.suggestionList = [];
                        }
                    }
                }
            });
            $scope.initRelation = () => {
                userFactory.getRelations($scope.user.ID, $scope.personnage.char_index).then(res => {
                    $scope.relationList = res.data;
                });
            };

            $scope.deleteRelation = relation => {
                $rootScope.$emit('modal:set', {
                    title: 'Supprimer une relation',
                    text: `Voulez vous vraiment supprimer la relation \"${relation.title}\" ?`,
                    validation: () => {
                        userFactory.deleteRelation($rootScope.currentUser.ID, $scope.personnage.char_index, relation.rid).then(function (res) {
                            $scope.initRelation();
                            $rootScope.setAlert('success', 'relation_delete');
                        });
                    }
                });
            };

            $scope.validateChar = () => {
                $scope.isValidatingFiche = true;
                if (!$scope.persoPost.pouvoir_id || ($scope.persoPost.pouvoir_id === -1)) {
                    if ($scope.user.pouvoir) {
                        $scope.persoPost.pouvoir_id = $scope.user.pouvoir;
                    } else {
                        $scope.persoPost.pouvoir_id = -1;
                    }
                }
                $scope.persoPost.is_custom = $scope.editCustomPower;

                $scope.persoPost.histoire = hensApp.formatContent($scope.persoPost.histoire);
                $scope.persoPost.particularite = hensApp.formatContent($scope.persoPost.particularite);
                $scope.persoPost.caractere = hensApp.formatContent($scope.persoPost.caractere);
                $scope.persoPost.pouvoir = hensApp.formatContent($scope.persoPost.pouvoir);
                if (!$scope.personnage.fid) {
                    let persoIndex = this.personnageList.length === 0 ? 1 : this.personnageIndex;
                    userFactory.createCharacter($rootScope.currentUser.ID, persoIndex, $scope.persoPost).then(function (data) {
                        $scope.personnage.new = false;
                        $scope.isValidatingFiche = false;
                        $scope.persoPost.fid = data.fid;
                        $scope.persoPost.char_index = data.char_index;
                        $scope.personnage = JSON.parse(JSON.stringify($scope.persoPost));
                        if ($scope.personnage) {
                            $scope.personnage.prenomFormat = $scope.personnage.prenom.replace("'", '-');
                        }
                        $rootScope.$broadcast('personnage:update', $scope.personnage);
                        $scope.showPerso = false;
                        $scope.isEditingChar = false;
                        $scope.persoPost.histoire = hensApp.parseContent($scope.persoPost.histoire);
                        $scope.persoPost.particularite = hensApp.parseContent($scope.persoPost.particularite);
                        $scope.persoPost.caractere = hensApp.parseContent($scope.persoPost.caractere);
                        $scope.persoPost.pouvoir = hensApp.parseContent($scope.persoPost.pouvoir);
                    }).catch($rootScope.handleError);
                } else {
                    userFactory.editCharacter($rootScope.currentUser.ID, $scope.persoPost).then(function (res) {
                        $scope.personnage.new = false;
                        $scope.isValidatingFiche = false;
                        $scope.personnage = JSON.parse(JSON.stringify(res.data));
                        if ($scope.personnage) {
                            $scope.personnage.prenomFormat = $scope.personnage.prenom.replace("'", '-');
                        }
                        $rootScope.$broadcast('personnage:update', $scope.personnage);
                        $scope.showPerso = false;
                        $scope.isEditingChar = false;
                        $scope.persoPost.histoire = hensApp.parseContent($scope.persoPost.histoire);
                        $scope.persoPost.particularite = hensApp.parseContent($scope.persoPost.particularite);
                        $scope.persoPost.caractere = hensApp.parseContent($scope.persoPost.caractere);
                        $scope.persoPost.pouvoir = hensApp.parseContent($scope.persoPost.pouvoir);
                    }).catch($rootScope.handleError);
                }
            };

            $rootScope.$on('perso-side-menu:set', (event, btn) => {
                $scope.state = btn;
            });
            $rootScope.$broadcast('perso-side-menu:request');
        }
    ]
});