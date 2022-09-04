/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('persoProfil', ['$http', 'userFactory', 'postFactory', 'socket',
    ($http, userFactory, postFactory, socket) => ({
        restrict: 'A',
        templateUrl: myLocalized.partials + 'persoProfil.html',
        scope: {
            profil: '=',
            show: '='
        },

        controller($scope, $element) {
            $scope.showEditFiche = false;
            $scope.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];
            $scope.currentPerso = {
                fiche: {},
                profil: {}
            };
            $scope.$watch('profil', function (n, o) {
                if (n !== o) {
                    $scope.currentPerso.profil = n;
                    return $scope.loadProfile();
                }
            });

            $scope.hideProfile = function () {
                $scope.show = false;
                return console.log('hiding');
            };

            $scope.display = function () {
                if ($scope.isMe && $scope.showFiche) {
                    return $scope.showEditFiche = true;
                } else if (!$scope.isMe && $scope.showFiche) {
                    return $scope.showEditFiche = false;
                }
            };

            $scope.villageSetup = function () {
                if ($scope.personnage.village != null && typeof $scope.personnage.village == 'number') {
                    const village = $scope.villages[$scope.personnage.village];
                    $('.valider').css('background', hensApp.color[village].neuter);
                    $element.find('.title-bar').find('.village').css('background-image', `url('${myLocalized.medias}common/${village}.png')`);
                    $element.find('.title-bar').find('.village').css('background-size', "100% 100%");
                    $element.find('.title-bar').find('.link-contrib').css('background', `${hensApp.color[village].neuter}`);
                    $element.find('.title-bar').find('.link-contrib').hover(function () {
                        return $(this).css('background', hensApp.color[village].light);
                    }, function () {
                        return $(this).css('background', hensApp.color[village].neuter);
                    });
                    $('.edit-bt').css('background', hensApp.color[village].neuter);
                    $('.edit-bt').hover(() => $('.edit-bt').css('background', hensApp.color[village].light), () => $('.edit-bt').css('background', hensApp.color[village].neuter));
                    $('.validate-change').css('background', hensApp.color[village].neuter);
                    $('.validate-change').hover(() => $('.validate-change').css('background', hensApp.color[village].light), () => $('.validate-change').css('background', hensApp.color[village].neuter));

                    $('.valider').hover(() => $('.valider').css('background', hensApp.color[village].light), () => $('.valider').css('background', hensApp.color[village].neuter));
                }
            };

            $scope.loadCharacter = function (user_id, char_index) {
                userFactory.getCharacter(user_id, char_index).then((res) => {
                    const personnage = res.data;
                    setTimeout(function () {
                        const ph = $('.avatar-container').height();
                        const pw = $('.avatar-container').width();
                        const {img} = $scope.profil;
                        $element.find('.avatar-img').css('height', ph);
                        $element.find('.avatar-img').css('width', img.w * (ph / img.h));
                        const nw = $element.find('.avatar-img').width();
                        $element.find('.avatar-img').css('margin-left', -(nw - pw) * (img.c / img.w));
                        return TweenLite.to($('.avatar-img'), 0.3, {opacity: 1});
                    }, 700);
                    if (personnage) {
                        let minus = $('.display-fiche').offset().top;
                        $('.display-fiche').css('height', $(window).height() - minus - 20);
                        // minus = $('.edit-fiche').offset().top;
                        // $('.edit-fiche').css('height', $(window).height() - minus - 20);
                        $scope.display();
                        $scope.persoPost = personnage;
                        $scope.personnage = personnage;
                        $scope.profilImgLink = `${myLocalized.medias}profil/perso/${$scope.personnage.zone != null ? $scope.personnage.zone + "/" : ""}${$scope.profil.perso}.jpg`;
                        for (let key in $scope.personnage) {
                            const value = $scope.personnage[key];
                            if ((value === "undefined") || (value === "")) {
                                $scope.personnage[key] = "";
                            }
                        }

                    } else {
                        $scope.personnage = {
                            prenom: '',
                            nom: '',
                            age: '',
                            village: null,
                            histoire: '',
                            particularite: '',
                            pouvoir: ''
                        };
                        $scope.post = {};
                    }
                    $scope.villageSetup();
                    $scope.display();
                });
            }

            $scope.loadProfile = function () {
                if ($scope.$parent.info !== undefined) {
                    if ($scope.$parent.info.user.slug === $scope.profil.owner) {
                        $scope.isMe = true;
                    } else {
                        $scope.isMe = false;
                    }
                } else if ($scope.$parent.$parent.info !== undefined) {
                    $scope.isMe =
                        $scope.$parent.$parent.info.user.slug === $scope.profil.owner;
                }

                $element.find('.avatar-img').css('opacity', 0);
                console.log($scope.profil);

                if ($scope.profil.char_index == null) {
                    $scope.profil.char_index = 1;
                }
                if ($scope.profil.id) {
                    $scope.loadCharacter($scope.profil.id, $scope.profil.char_index);
                } else {
                    userFactory.getUserBySlug($scope.profil.owner).then(function (res) {
                        $scope.author = res.data;
                        $scope.loadCharacter($scope.author.ID, $scope.profil.char_index);
                    });
                }
            };

            $scope.showEdit = () => $scope.showEditFiche = !$scope.showEditFiche;

            $scope.close = () => $scope.showEditFiche = false;
            $scope.validateChar = function () {
                let post;
                $scope.editProcess = true;
                if ($scope.persoPost === undefined) {
                    hensApp.log('new post');
                    post = {
                        title: `Fiche de Personnage de ${$scope.post.author.username}`,
                        content_raw: `${$scope.personnage.prenom}|:|${$scope.personnage.nom}|:|${$scope.personnage.suffixe}|:|${$scope.personnage.age}|:|${$scope.personnage.village}|:|${$scope.personnage.histoire}|:|${$scope.personnage.caractere}|:|${$scope.personnage.particularite}|:|${$scope.personnage.pouvoir}|:|`,
                        name: `hensApp-${$scope.post.author.slug}-ficheperso`,
                        type: "post",
                        comment_status: "opened",
                        status: "publish"
                    };

                    postFactory.newPost(post).then(function (res) {
                        $scope.editProcess = false;
                        return $scope.close();
                    });
                } else {
                    hensApp.log('post update');
                    post = {
                        ID: $scope.persoPost.ID,
                        title: `Fiche de Personnage de ${$scope.post.author.username}`,
                        content_raw: `${$scope.personnage.prenom}|:|${$scope.personnage.nom}|:|${$scope.personnage.suffixe}|:|${$scope.personnage.age}|:|${$scope.personnage.village}|:|${$scope.personnage.histoire}|:|${$scope.personnage.caractere}|:|${$scope.personnage.particularite}|:|${$scope.personnage.pouvoir}|:|`,
                        name: `hensapp-${$scope.post.author.slug}-ficheperso`,
                        type: "post",
                        comment_status: "opened",
                        status: "publish"
                    };
                    postFactory.updatePost(post).then(function (res) {
                        $scope.editProcess = false;
                        $scope.close();
                    });
                }
            };
        }
    })

]);
