hensApp.controller('annonceDetail', ['$scope', 'annoncesFactory', '$rootScope', '$routeParams', '$location', 'userFactory',
    function ($scope, annoncesFactory, $rootScope, $routeParams, $location, userFactory) {
        $scope.$parent.info.isAppInit = false;
        $scope.annoncesManager = annoncesFactory;
        $scope.commentContent = "";
        $scope.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];
        $scope.locations = [
            ['village', 'falaise', 'forêt', 'marais'],
            ['village', 'mer', 'lac', 'prairie'],
            ['village', 'champs', 'bois', 'rivière'],
            ['village', 'montagne', 'collines', 'souterrains']
        ];
        $scope.init = () =>
            $scope.annoncesManager.getById($routeParams.id).then(function (data) {
                ({ data } = data);
                if (data.error) {
                    console.error('Annonce not found: ', $routeParams.id);
                    $rootScope.setAlert('error', 'annonce_empty');
                    return $location.path('/map');
                } else {
                    let invited;
                    $scope.annonce = data;
                    if (moment(new Date(0)).isBefore(moment($scope.annonce.start_time))) {
                        $scope.annonce.formatDate = moment($scope.annonce.start_time).format('DD/MM');
                    }
                    for (const participant of $scope.annonce.participants) {
                        if ($rootScope.currentUser.ID === participant.ID) {
                            $scope.annonce.isParticipating = true;
                            break;
                        }
                    }
                    for (let comment of Array.from($scope.annonce.comments)) {
                        for (participant of Array.from($scope.annonce.participants)) {
                            if (participant.ID === comment.owner_id) {
                                comment.author = participant;
                            }
                        }
                        for (invited of Array.from($scope.annonce.inviteList)) {
                            if (invited.ID === comment.owner_id) {
                                comment.author = invited;
                            }
                        }
                        for (let ghost of Array.from($scope.annonce.ghosts)) {
                            if (ghost.ID === comment.owner_id) {
                                comment.author = ghost;
                            }
                        }
                        comment.formatDate = moment(comment.creation_time).format('DD/MM/YY HH:mm');
                    }
                    // can participate button annonce
                    const userCanLeave = function (ID, annonce) {
                        if (annonce.owner.ID === ID) {
                            return false;
                        }
                        for (participant of Array.from(annonce.participants)) {
                            if (participant.ID === ID) {
                                return true;
                            }
                        }
                        return false;
                    };

                    const userCanParticipate = function (ID, annonce) {
                        if (annonce.owner.ID === ID) {
                            return false;
                        }
                        for (participant of Array.from(annonce.participants)) {
                            if (participant.ID === ID) {
                                return false;
                            }
                        }

                        if (annonce.is_private) {
                            for (invited of Array.from(annonce.inviteList)) {
                                if (invited.ID === ID) {
                                    return true;
                                }
                            }
                            return false;
                        } else {
                            if (annonce.limit_size === -1) {
                                return true;
                            } else if (annonce.participants.length < annonce.limit_size) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        return false;
                    };

                    const userIsInvited = function (ID, annonce) {
                        for (invited of Array.from(annonce.inviteList)) {
                            if (invited.ID === ID) {
                                return true;
                            }
                        }
                        return false;
                    };
                    $scope.userIsInvited = userIsInvited($rootScope.currentUser.ID, $scope.annonce);
                    $scope.canUserParticipate = userCanParticipate($rootScope.currentUser.ID, $scope.annonce);
                    $scope.canUserLeave = userCanLeave($rootScope.currentUser.ID, $scope.annonce);
                    return $scope.$parent.info.isAppInit = true;
                }
            })
            ;


        $scope.sendComment = function () {
            if ($scope.commentContent.trim().length > 0) {
                $scope.annoncesManager.comment($scope.annonce.aid, { text: $scope.commentContent }).then(data => {
                    $rootScope.setAlert("success", "annonce_commnent_posted");
                    $scope.init();
                }).catch($rootScope.handleError);
                return $scope.commentContent = "";
            } else {
                return $rootScope.setAlert('error', 'message_empty', 30);
            }
        };

        $scope.editComment = function (comment, index) {
            // TODO LOL
            // $rootScope.setAlert("success", "annonce_comment_updated");
        }

        $scope.kickUser = participant =>
            $rootScope.$emit('modal:set', {
                title: 'Expulser un joueur',
                text: `Voulez vous vraiment éjecter ${participant.display_name} ?`,
                validation: () => {
                    return $scope.annoncesManager.kick($scope.annonce.aid, {
                        user_id: participant.ID
                    }).then(res => {
                        $rootScope.setAlert("success", 'annonce_kick');
                        $scope.init();
                    }).catch($rootScope.handleError);
                }

            })
            ;

        $scope.joinRP = () => {
            $scope.annoncesManager.join($scope.annonce.aid).then(function (res) {
                $rootScope.setAlert("success", "annonce_join");
                $scope.init();
            }).catch($rootScope.handleError);
        };

        $scope.acceptInvite = () => {
            $scope.annoncesManager.acceptInvite($scope.annonce.aid).then(function (res) {
                $rootScope.setAlert("success", "annonce_invite_accept");
                $scope.init();
            }).catch($rootScope.handleError);
        };

        $scope.closeRP = () =>
            $rootScope.$emit('modal:set', {
                title: 'Fermer une annonce',
                text: "Voulez vous vraiment fermer cette annonce ? Elle ne sera plus accessible par la suite.",
                validation: () => {
                    $scope.annoncesManager.close($scope.annonce.aid).then(function (res) {
                        $rootScope.setAlert('success', "annonce_close");
                        $location.path('annonces');
                    }).catch($rootScope.handleError);
                }
            })
            ;
        $scope.leaveRP = () =>
            $rootScope.$emit('modal:set', {
                title: 'Quitter une annonce',
                text: "Voulez vous vraiment quitter cette annonce ?",
                validation: () => {
                    return $scope.annoncesManager.leave($scope.annonce.aid).then(function (res) {
                        $rootScope.setAlert("success", "annonce_left");
                        $scope.init();
                    }).catch($rootScope.handleError);

                }
            })
            ;

        if ($rootScope.isInitialized) {
            return $scope.init();
        } else {
            return $rootScope.$watch('isInitialized', function (n, o) {
                if (n && (n !== o)) {
                    return $scope.init();
                }
            });
        }
    }

]);
