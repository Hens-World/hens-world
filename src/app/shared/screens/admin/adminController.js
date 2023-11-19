angular.module('app').controller('Admin', [
    '$scope', '$rootScope', 'adminFactory', 'accountFactory', 'userFactory', function ($scope, $rootScope, adminFactory, accountFactory, userFactory) {
        $scope.$parent.info.isAppInit = false;

        $scope.categories = {};
        $scope.characters = {
            1: 'Ellire',
            2: 'Aulne',
            3: 'Puck',
            4: 'Anatole',
            5: 'Nawja'
        };
        $scope.newDialogueData = {};
        $scope.newReponseData = {};

        adminFactory.getAdmin().then((data) => {
            $scope.indexData = data.data;
            $scope.$parent.info.isAppInit = true;
            $scope.isAdminValid = true;

            $scope.dialog.load();
        }).catch($rootScope.handleError);

        $scope.toggle = (categoryName) => {
            $scope.categories[categoryName] = !$scope.categories[categoryName];
        }

        $scope.isShown = (categoryName) => {
            return $scope.categories[categoryName];
        }

        $scope.dialog = {
            open: (dialogue) => {
                dialogue.open = true;
                $scope.dialog.reponse.load(dialogue);
            },
            load: () => {
                adminFactory.getDialogues().then((data) => {
                    $scope.dialogues = data.data.map((dialogue => {
                        return {
                            data: dialogue,
                            initialData: dialogue,
                            open: false,
                            openReponse: false
                        }
                    }));
                });
            },
            close: (dialogue) => {
                dialogue.open = false;
            },
            closeNew: () => {
                $scope.dialogueCreationOpen = false;
            },
            postNew: () => {
                if (!$scope.newDialogueData.text || $scope.newDialogueData.text.length === 0) {
                    return $rootScope.setAlert('error', 'Dialogue vide!');
                }
                adminFactory.postDialogue($scope.newDialogueData).then((data) => {
                    let createdDialogue = data.data;
                    $scope.dialogues.push({
                        open: false,
                        data: createdDialogue,
                        initialData: createdDialogue,
                        openReponse: false
                    });
                    $rootScope.setAlert('success', 'Dialogue créé!')
                }).catch($rootScope.handleError);
                $scope.newDialogueData = {};
            },
            confirmEdit: (dialogue) => {
                adminFactory.editDialogue(dialogue.data).then((data) => {
                    $rootScope.setAlert('success', 'Dialogue mis à jour!');
                    dialogue.initialData = data.data;
                }).catch($rootScope.handleError);
            },
            delete: (dialogue) => {
                adminFactory.deleteDialogue(dialogue.data).then(() => {
                    $rootScope.setAlert('success', 'Dialogue supprimé!');
                    $scope.loadDialogues();
                }).catch($rootScope.handleError);
            },
            reponse: {
                openNew: (dialogue) => {
                    dialogue.openReponse = true;
                    $scope.newReponseData.dialogue_id = dialogue.data.id;
                },
                load: (dialogue) => {
                    adminFactory.getReponses(dialogue.data.id).then((data) => {
                        dialogue.reponses = data.data;
                    });
                },
                closeNew: (dialogue) => {
                    dialogue.openReponse = false;
                    $scope.newReponseData.dialogue_id = null;
                },
                postNew: (dialogue) => {
                    adminFactory.postReponse($scope.newReponseData).then((data) => {
                        let createdReponse = data.data;
                        if (!dialogue.reponses) dialogue.reponses = [];
                        dialogue.reponses.push(createdReponse);
                        $rootScope.setAlert('success', 'Réponse créée!');
                    }).catch($rootScope.handleError);
                },
                confimEdit: (dialogue, reponse) => {
                    reponse.dialogue_id = dialogue.id;
                    adminFactory.editReponse(reponse).then((updatedReponse) => {
                        reponse.editing = false;
                        $rootScope.setAlert('success', 'Réponse mise à jour !');
                    });
                },
                delete: (dialogue, reponse) => {
                    reponse.dialogue_id = dialogue.data.id;
                    adminFactory.deleteReponse(reponse).then(() => {
                        $rootScope.setAlert('success', 'Réponse supprimmée!');
                        $scope.loadReponse(dialogue);
                    });
                },
            },
        };

        $scope.account = {
            source_id: 8,
            source: null,
            target_id: 10,
            target: null,
            detect_change(n, o) {
                if (!isNaN(n)) {
                    $scope.account.load();
                    $scope.account.character.load();
                }
            },
            load() {
                userFactory.getUserById($scope.account.source_id).then((user) => {
                    $scope.account.source = user.data;
                }).catch($rootScope.handleError);

                userFactory.getUserById($scope.account.target_id).then((user) => {
                    $scope.account.target = user.data;
                }).catch($rootScope.handleError);
            },
            character: {
                source_index: 1,
                source: null,
                target_index: 1,
                target: null,
                detect_change(n, o) {
                    console.log("detect char changes", n, o);
                    if (!isNaN(n)) {
                        $scope.account.character.load();
                    }
                },
                load() {
                    userFactory.getCharacter($scope.account.source_id, $scope.account.character.source_index).then((user) => {
                        $scope.account.character.source = user.data;
                        if ($scope.account.character.source != null) {
                            $scope.account.character.source.village = hensApp.villages[$scope.account.character.source.village];
                        }
                    }).catch($rootScope.handleError);

                    userFactory.getCharacter($scope.account.target_id, $scope.account.character.target_index).then((user) => {
                        $scope.account.character.target = user.data;
                        if ($scope.account.character.target != null) {
                            $scope.account.character.target.village = hensApp.villages[$scope.account.character.target.village];
                        }
                    }).catch($rootScope.handleError);
                },
                move_to() {
                    adminFactory.move_character_to_account(
                        $scope.account.source_id,
                        $scope.account.character.source_index,
                        $scope.account.target_id,
                        $scope.account.character.target_index)
                        .then(() => {
                            $rootScope.setAlert("success",
                                `${$scope.account.character.source.prenom}, a été déplacé depuis ${$scope.account.source.display_name} vers ${$scope.account.target.display_name}`);
                            $scope.account.character.load();
                        })
                        .catch($rootScope.handleError)
                },
            },
        };

        $scope.$watch("account.source_id", $scope.account.detect_change);
        $scope.$watch("account.target_id", $scope.account.detect_change);
        $scope.$watch("account.character.source_index", $scope.account.character.detect_change);
        $scope.$watch("account.character.target_index", $scope.account.character.detect_change);
    }
]);
