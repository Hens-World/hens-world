angular.module('app').component('mainHeader', {
    templateUrl: myLocalized.specPartials + 'mainHeader.html',
    controllerAs: 'headCtrl', // bindings: {
    //   link: '<'
    controller: [
        '$scope', '$element', '$rootScope', 'accountFactory', '$location', 'socket', '$compile',
        function ($scope, $element, $rootScope, accountFactory, $location, socket, $compile) {
            this.currentPage = null;

            class category {
                constructor(css, label, id, link) {
                    this.label = label;
                    this.id = id;
                    this.link = link;
                    this.css = css;
                }
            }

            this.toggleForgotPassword = (boolean) => {
                $rootScope.$emit('toggleForgotPassword');
            };
            this.notifList = [];

            this.updateNotifTitle = function () {
                if ((document.title.indexOf('(') === 0) && (document.title.indexOf(')') >= 2)) {
                    if (this.notifList.length === 0) {
                        return document.title =
                            document.title.substr(document.title.indexOf(')') + 1, document.title.length);
                    } else {
                        return document.title =
                            `(${this.notifList.length}) ` +
                            document.title.substr(document.title.indexOf(')') + 1, document.title.length);
                    }
                } else {
                    if (this.notifList.length === 0) {
                        document.title = document.title;
                    } else {
                        document.title = `(${this.notifList.length}) ` + document.title;
                    }
                }
            };

            this.showNotifList = false;
            this.isTryingLogin = false;

            this.disconnect = (e) => {
                accountFactory.disconnect().then(data => {
                    location.reload();
                });
            };

            this.triggerSignUp = function () {
                $location.path("inscription");
                $location.path().replace();
                $scope.$emit('app:init');
            };

            this.toggleNotif = () => this.showNotifList = !this.showNotifList;

            this.notifClick = function (index) {
                const notif = this.notifList[index];
                if (notif.command_key === 'link') {
                    $location.url(notif.command_value);
                    this.showNotifList = false;
                }
                socket.emit('notification:read', { id: notif.nid });
                this.notifList.splice(index, 1);
                this.updateNotifTitle();
            };

            this.clearAllNotifications = () => {
                $rootScope.$emit('modal:set', {
                    title: 'Supprimer toutes les notifications',
                    text: `Voulez vous vraiment supprimer vos ${this.notifList.length} notifications ? ${$rootScope.currentUser.ID ===
                        3014 ?
                        '(Sun fait pas ça, arrêtes, tu peux pas faire ça à tes notifications, elles vont faire quoi sans toi ? :( )' :
                        ''}`,
                    validation: () => {
                        socket.emit('notification:readList', this.notifList.map(notif => notif.nid));
                    }
                });
            };

            this.removeNotif = value => this.notifList.forEach(function (notif, index) {
                if (notif.tag === value) {
                    return this.notifList.splice(index, 1);
                }
            });

            this.closeSignUp = () => this.displaySignup = false;

            this.launchContribMail = function () {
                $scope.displaySignup = true;
                $('.popup-contrib-container').empty();
                const div = "<div contributor-mail class='active contributor-mail-container'> </div>";
                const html = $(div);
                const comp = $compile(div)($scope);
                $('.popup-contrib-container').prepend(comp);
            };

            this.login = () => {
                accountFactory.login(this.logInfo.login, this.logInfo.password).then(function (data) {
                    location.reload();
                }).catch(e => {
                    $rootScope.$emit(HEADER_EVENTS.ERROR);
                });
            };

            this.categories = [
                new category("carte-archipel", "Carte du monde", "carte", "map"),
                new category("guide-touristique", "Guide touristique", "carte", "guide-touristique"),
                new category("population", "Jeu de rôle", "carte", "roleplay/create-type"),
                new category("don", "Ko-fi", "don", "https://ko-fi.com/hensworld")
            ];

            this.currentUser = $rootScope.currentUser;
            $rootScope.$watch('currentUser', (n, o) => {
                if (n && n != o) {
                    this.currentUser = n;
                }
            });

            $scope.$on('notif:new', (event, notif) => {
                let exists = false;
                for (let n of Array.from(this.notifList)) {
                    if (n.nid === notif.nid) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    if (notif.creation_time) {
                        notif.formatDate = moment(notif.creation_time).format('YYYY-MM-DD HH:mm');
                    } else {
                        notif.formatDate = moment().format('YYYY-MM-DD HH:mm');
                    }
                    this.notifList.unshift(notif);
                    this.updateNotifTitle();
                }
            });

            $rootScope.$on('notif:clear', () => {
                this.notifList = [];
                this.updateNotifTitle();
            });

            $scope.$on(HEADER_EVENTS.CURRENT_PAGE, (event, data) => {
                this.setCurrentPage(data);
            });

            $rootScope.$on(HEADER_EVENTS.LOAD, () => {
                this.headerElement.classList.add('loading');
                this.headerElement.classList.remove('success');
                this.headerElement.classList.remove('error');
            });

            $rootScope.$on(HEADER_EVENTS.SUCCESS, () => {
                this.headerElement.classList.add('success');
                this.headerElement.classList.remove('loading');
            });

            $rootScope.$on(HEADER_EVENTS.LOADED, () => {
                this.headerElement.classList.remove('loading');
            });

            $rootScope.$on(HEADER_EVENTS.ERROR, () => {
                this.headerElement.classList.add('error');
                this.headerElement.classList.remove('loading');
            });

            this.setCurrentPage = (page) => {
                this.currentPage = page;
            };

            this.$onInit = () => {
                this.headerElement = document.getElementById("header");
            }
        }
    ], // },
});