String.prototype.lines = function () {
    return this.split(/\r*\n/);
}
String.prototype.lineCount = function () {
    return this.lines().length - (navigator.userAgent.indexOf("MSIE") != -1);
}

angular.module('app').component('solsticeAnar', {
    templateUrl: myLocalized.partials + 'solsticeAnar.html',
    controllerAs: 'ltnCtrl',
    bindings: {
        type: '@'
    },
    controller: [
        '$scope', '$element', '$rootScope', 'eventsFactory', 'userFactory', 'socket',
        function ($scope, $element, $rootScope, eventsFactory, userFactory, socket) {
            this.villages = hensApp.villages;
            $scope.allRoles = true;
            $scope.searchList = {
                charactersReceiving: [],
                usersReceiving: []
            };
            this.chosenSender = 'user';
            this.chosenReceiver = null;
            this.lanternData = {
                width: 97,
                height: 96
            };
            this.lanternThemes = [
                {
                    name: 'sulimo',
                    icon: 'icon_lettre_sulimo',
                    image: 'papier_lettre_sulimo',
                    color: '#fbdc86'
                }, {
                    name: 'ulmo',
                    icon: 'icon_lettre_ulmo',
                    image: 'papier_lettre_ulmo',
                    color: '#bbe6ea'
                }, {
                    name: 'wilwar',
                    icon: 'icon_lettre_wilwar',
                    image: 'papier_lettre_wilwar',
                    color: '#daf99e'
                }, {
                    name: 'anar',
                    icon: 'icon_lettre_anar',
                    image: 'papier_lettre_anar',
                    color: '#f9d5af'
                }, {
                    name: 'coeur',
                    icon: 'icon_lettre_coeur',
                    image: 'papier_lettre_coeur',
                    color: '#ffdddd'
                }, {
                    name: 'ghost',
                    icon: 'icon_lettre_ghost',
                    image: 'papier_lettre_ghost',
                    color: '#dbdde0'
                },
            ];
            this.selectedTheme = this.lanternThemes[0];
            this.map = $scope.$parent;
            this.$onInit = () => {
                this.lanternCreation = {
                    intro: "Cher•e",
                    message: "Ecrivez votre message ici !",
                    preSignature: "Love",
                    toCharacter: null,
                    toUser: null,
                    fromCharacter: null,
                    anonymous: null,
                    position: {
                        x: null,
                        y: null
                    }
                };

                this.controlMessage = () => {
                    if (this.lanternCreation.message.split('\n').length > 5 || this.lanternCreation.message.length > 300 - 45 *
                        this.lanternCreation.message.split('\n').length) {
                        this.lanternCreation.message =
                            this.lanternCreation.message.slice(0, this.lanternCreation.message.length - 2).trim();
                        $rootScope.setAlert('error', this.lanternCreation.message.length > 300 ?
                            'Votre lettre est complète ! (300 caractères max)' :
                            'Vous avez utilisé tout l\'espace sur le papier à lettre !');
                        if (this.type === 'ui') {
                            $element.find('textarea')[0].animate([
                                {outline: '5px solid rgba(255,0,0,0.6)'}, {outline: '1px solid rgba(255,0,0,0)'}
                            ], {
                                duration: 350
                            });
                        }
                    }
                };

                this.init = () => {
                    this.resetPendingLantern();
                    eventsFactory.solsticeEte.getLanterns(this.map.district).then(data => {
                        let lanterns = data.data;
                        console.log(lanterns);
                        this.lanterns = lanterns.map((lantern) => {
                            lantern.themeData = this.lanternThemes.find(theme => theme.name === lantern.theme);
                            if (lantern.anonymous) {
                                lantern.senderName = "Anonyme";
                                lantern.senderVillage = null;
                            } else if (lantern.senderCharacter) {
                                lantern.senderName = lantern.senderCharacter.prenom;
                                lantern.senderVillage = this.villages[lantern.senderCharacter.village];
                            } else {
                                lantern.senderName = lantern.owner.display_name;
                                lantern.senderVillage = lantern.owner.village;
                            }
                            if (lantern.receiverCharacter) {
                                lantern.receiverName = lantern.receiverCharacter.prenom;
                                lantern.receiverVillage = this.villages[lantern.receiverCharacter.village];
                            } else if (lantern.receiverUser) {
                                lantern.receiverName = lantern.receiverUser.display_name;
                                lantern.receiverVillage = lantern.receiverUser.village;
                            } else {
                                lantern.receiverName = "Anonyme";
                            }
                            lantern.delay = -Math.random() * 7;
                            return lantern;
                        });
                    }).catch($rootScope.handleError);
                    eventsFactory.solsticeEte.getLanternsLeft().then(data => {
                        this.remainingLanterns = data.data;
                    });
                };
                this.startPlacing = () => {
                    if (this.remainingLanterns <= 0) {
                        return $rootScope.setAlert('error', "Vous n'avez plus de lanternes !");
                    }
                    this.placing = true;
                    this.map.mapState.disabled = false;
                    this.map.mapState.fixed = false;
                    this.creating = false;
                };
                this.cancelLantern = () => {
                    this.placing = false;
                    this.map.mapState.disabled = false;
                    this.map.mapState.fixed = false;
                    this.creating = false;
                    this.chosenReceiver = null;
                    this.chosenSender = null;
                    this.lanternCreation = {
                        intro: "Cher•e",
                        message: "Ecrivez votre message ici !",
                        preSignature: "Love",
                        toCharacter: null,
                        toUser: null,
                        fromCharacter: null,
                        anonymous: null,
                        position: {
                            x: null,
                            y: null
                        }
                    };
                    let pendingLantern = $element.find('.solstice-anar__lantern--pending')[0];
                    if (pendingLantern) {
                        pendingLantern.style.transform = `translate(-100px, -100px)`;
                    }
                    this.chosenReceiverName = null;
                    this.chosenReceiverVillage = null;
                };
                this.placeLantern = (e) => {
                    this.placing = false;
                    this.map.mapState.disabled = true;
                    this.map.mapState.fixed = true;
                    this.creating = true;
                    this.lanternCreation.position.x = e.pageX - this.map.mapOffset.x - this.lanternData.width / 2;
                    this.lanternCreation.position.y = e.pageY - this.map.mapOffset.y - this.lanternData.height / 2 - 80;
                    this.map.mapOffset.x = -(this.lanternCreation.position.x - window.innerWidth * .25);
                    this.map.mapOffset.y = -(this.lanternCreation.position.y - window.innerHeight * .5);
                    let pendingLantern = $element.find('.solstice-anar__lantern--pending')[0];
                    if (pendingLantern) {
                        pendingLantern.style.transform = `translate(${this.lanternCreation.position.x}px, ${this.lanternCreation.position.y}px)`;
                    }
                    /**
                     * Initialize inputs length
                     */
                    setTimeout(() => {
                        this.focusedInput = $element.find('.intro input')[0];
                        this.adjustInput();
                        this.focusedInput = $element.find('.preSignature input')[0];
                        this.adjustInput();
                    }, 0);
                };
                this.createLantern = () => {
                    if (this.chosenReceiver == null) {
                        return $rootScope.setAlert('error', 'Vous ne pouvez pas déposer de lanterne sans avoir choisi de destinataire !');
                    }
                    $rootScope.$emit('modal:set', {
                        title: 'Poser une lanterne',
                        text: `Êtes vous sûr de vouloir poser cette lanterne ici ? Vous ne pourrez plus l'éditer une fois validée.`,
                        validation: () => {
                            this.creating = false;
                            this.map.mapState.disabled = false;
                            this.map.mapState.fixed = false;
                            this.lanternCreation.quartier = this.map.district;
                            this.lanternCreation.theme = this.selectedTheme.name;
                            this.resetPendingLantern();
                            eventsFactory.solsticeEte.createLantern(this.lanternCreation).then((result) => {
                                this.init();
                                $rootScope.setAlert('success', result.data.unlockedRank ? "Votre lanterne a bien été placée ! Vous avez débloqué le théme de Anar ! Consultez vos paramètres pour en savoir plus :)" : "Votre lanterne a bien été placée !");
                            }).catch($rootScope.handleError);
                        }
                    });

                };
                this.moveInvisibleLantern = (event) => {
                    let invisLantern = $element.find('.invisible-lantern');
                    if (invisLantern[0]) {
                        invisLantern[0].style.left = event.pageX - this.lanternData.width / 2 + 'px';
                        invisLantern[0].style.top = event.pageY - this.lanternData.height / 2 + 'px';
                    }
                };

                this.setFocusedInput = (e) => {
                    this.focusedInput = e.currentTarget;
                };

                this.adjustInput = () => {
                    var tmp = document.createElement("span");
                    tmp.style.fontSize = '17.3px';
                    tmp.style.fontFamily = "'Crimson Text'";
                    tmp.innerHTML = this.focusedInput.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    document.body.appendChild(tmp);
                    var theWidth = tmp.getBoundingClientRect().width;
                    console.log(theWidth);
                    document.body.removeChild(tmp);
                    this.focusedInput.style.width = theWidth + 'px';
                };

                this.selectTheme = (theme) => {
                    this.selectedTheme = theme;
                };

                this.toggleChooseSender = (senderType, char_index) => {
                    this.chosenSender = senderType;
                    switch (this.chosenSender) {
                        case 'personnage':
                            this.personnage = this.personnages.find(p => p.char_index === char_index);
                            this.chosenSenderName = this.personnage.prenom;
                            this.lanternCreation.fromCharacter = this.personnage.fid;
                            this.chosenSenderVillage = this.villages[this.personnage.village];
                            this.lanternCreation.anonymous = false;
                            break;
                        case 'user':
                            this.chosenSenderName = $rootScope.currentUser.display_name;
                            this.chosenSenderVillage = $rootScope.currentUser.village;
                            this.lanternCreation.anonymous = false;
                            this.lanternCreation.fromCharacter = null;
                            break;
                        case 'anonymous':
                            this.chosenSenderName = 'anonyme';
                            this.chosenSenderVillage = $rootScope.currentUser.village;
                            this.lanternCreation.anonymous = true;
                            this.lanternCreation.fromCharacter = null;
                    }
                };

                this.selectReceiver = (receiverType) => {
                    this.chosenReceiver = receiverType;
                    switch (receiverType) {
                        case 'personnage':
                            this.showingPersoDetail = true;
                            this.showingMemberDetail = false;
                            this.lanternCreation.toUser = null;
                            $scope.searchList.charactersReceiving.length = 0;
                            break;
                        case 'user':
                            this.showingPersoDetail = false;
                            this.showingMemberDetail = true;
                            $scope.searchList.usersReceiving.length = 0;
                            this.lanternCreation.toCharacter = null;
                            break;
                        case 'anonymous':
                            this.showingMemberDetail = false;
                            this.showingPersoDetail = false;
                            this.lanternCreation.toCharacter = null;
                            this.chosenReceiverName = "Anonyme";
                            this.lanternCreation.toUser = null;
                            break;
                    }
                };

                $scope.$watchCollection('searchList.charactersReceiving', (n, o) => {
                    console.log('update char');
                    if (n !== o && n.length >= 1) {
                        $scope.searchList.charactersReceiving.length = 1;
                        this.lanternCreation.toCharacter = n[0].fid;
                        this.showingPersoDetail = false;
                        this.chosenReceiverVillage = this.villages[n[0].village];
                        this.chosenReceiverName = n[0].prenom;
                    }
                }, true);
                $scope.$watchCollection('searchList.usersReceiving', (n, o) => {
                    console.log('update users');
                    if (n !== o && n.length >= 1) {
                        $scope.searchList.usersReceiving.length = 1;
                        this.lanternCreation.toUser = n[0].ID;
                        this.showingMemberDetail = false;
                        this.chosenReceiverVillage = n[0].village;
                        this.chosenReceiverName = n[0].display_name;
                    }
                }, true);

                this.openLantern = (lantern) => {
                    this.currentLantern = lantern;
                };

                this.closeCurrentLantern = (e) => {
                    if (!e || e.currentTarget === e.target) {
                        this.currentLantern = null;
                    }
                };

                this.resetPendingLantern = () => {
                    let pendingLantern = $element.find('.solstice-anar__lantern--pending')[0];
                    pendingLantern.style.transform = "translate(-200px, -200px)";
                };

                this.init();
                this.toggleChooseSender('user');
                userFactory.getCharacters($rootScope.currentUser.ID).then(data => {
                    this.personnages = data.data;
                });
            };
        }
    ]
});