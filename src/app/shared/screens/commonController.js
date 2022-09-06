/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

// We listen to the resize event
window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

hensApp.controller('commonController', [
    '$scope', 'mediaFactory', 'userFactory', 'postFactory', '$location', '$rootScope', '$compile', 'socket',
    'whisperFactory', 'accountFactory', 'formFactory', 'storageFactory',
    function ($scope, mediaFactory, userFactory, postFactory, $location, $rootScope, $compile, socket, whisperFactory, accountFactory, formFactory, storageFactory) {
        // common scroll bar test3
        $rootScope.isInitialized = false;
        $rootScope.info = {};
        $rootScope.villages = hensApp.villages;
        $('.ngview').niceScroll(hensApp.niceScrollOptions);

        //   .M"""bgd                  `7MM               mm
        //  ,MI    "Y                    MM               MM
        //  `MMb.      ,pW"Wq.   ,p6"bo  MM  <P'.gP"Ya mmMMmm
        //    `YMMNq. 6W'   `Wb 6M'  OO  MM ;Y  ,M'   Yb  MM
        //  .     `MM 8M     M8 8M       MM;Mm  8M""""""  MM
        //  Mb     dM YA.   ,A9 YM.    , MM `Mb.YM.    ,  MM
        //  P"Ybmmd"   `Ybmd9'   YMbmd'.JMML. YA.`Mbmmd'  `Mbmo

        $scope.initSocket = function () {
            $rootScope.socket = socket;
            socket.connect();

            $rootScope.tchatInfo = {
                tchatOpen: false,
                channel: 0
            };

            $rootScope.mobileCheck = window.mobilecheck;

            socket.on('globalList', length => $rootScope.info.globalList = length);

            socket.on('rpList', length => $rootScope.info.rpList = length);

            socket.on('disconnect', () => $rootScope.socketConnected = false);

            socket.on('notifications:push', list => Array.from(list).map((notif) => $scope.newNotif(notif)));
            userFactory.getNotifications().then(data => Array.from(data.data).map((notif) => $scope.newNotif(notif)));

            socket.on('whisper:new_message', subject => $rootScope.addNewMessage(subject));

            socket.on('app:error', msg => {
                $rootScope.setAlert('error', msg)
            });

            socket.on('notification:clear', () => {
                $rootScope.$broadcast('notif:clear');
            });

            socket.on('app:message', msgData => {
                console.log("APP MESSAGE", msgData);
                $rootScope.setAlert(msgData.type, msgData.msg);
            });

            if ($location.search().action === 'contribute') {
                return $scope.launchContribMail();
            }
        };

        //  `7MM"""YMM
        //    MM    `7
        //    MM   d `7MMpMMMb.
        //    MM""MM   MM    MM
        //    MM   Y   MM    MM
        //    MM       MM    MM
        //  .JMML.   .JMML  JMML.

        /*
          Logs the user to the node platform
          fills the php wordpress form then post login to wordpress
          forces cookie on user
        */

        $rootScope.setCurrentPage = (page) => {
            $scope.$broadcast(HEADER_EVENTS.CURRENT_PAGE, page);
        };

        $rootScope.handleError = (e) => {
            console.log(e);
            if (!e.data) {
                $rootScope.setAlert('error', 'Erreur inconnue');
                console.error(e);
            } else if (!!formFactory.setFormError(e.data.msg, e.data.field, e.data.values)) {
                $rootScope.setAlert('error', e.data.msg, null, e.data.values);
            }
            $rootScope.$emit(HEADER_EVENTS.ERROR);
        };

        $scope.toggleEdition = function () {
            if (!$scope.isShowEdition && !$scope.isEditionSet) {
                $scope.isEditionSet = true;
                const html = "<div class='title'> Changer de mot de passe </div>";
                $(html).insertBefore('.wppb-default-password');
            }
            return $scope.isShowEdition = !$scope.isShowEdition;
        };

        $scope.displayMe = function (res) {
            if ($location.path() === '/') {
                if (window.mobilecheck()) {
                    $location.path('navbar');
                } else if (res != null) {
                    $location.path('map');
                }
                $location.replace();
            }
            if (res == null) return;

            if (res.data.avatar === undefined) {
                res.data.avatar = myLocalized.medias + 'profil/no-avatar.png';
            }
            $rootScope.currentUser = res.data;
            storageFactory.initStorage();
            $scope.info.user = res.data;
            $rootScope.isInitialized = true;
            whisperFactory.getNewCount().then(res => $rootScope.newMessages = res.data);
            hensApp.u = res.data;
            $rootScope.info = {
                rpList: 0,
                globalList: 0
            };

            $rootScope.info.user = $scope.info.user;
            $scope.initSocket();
            console.info(`Hello ${$rootScope.info.user.display_name}!`);
            console.info(`Welcome to Hens World v${hensApp.version}! The site is still en alpha, you may find some bugs. :)`);
        };

        $scope.$on('$routeChangeStart', function () {
            $scope.info.isAppInit = false;
        });

        //                      ,,
        //  `7MMF'              db   mm
        //    MM                     MM
        //    MM  `7MMpMMMb.  `7MM mmMMmm
        //    MM    MM    MM    MM   MM
        //    MM    MM    MM    MM   MM
        //    MM    MM    MM    MM   MM
        //  .JMML..JMML  JMML..JMML. `Mbmo

        $scope.isShowEdition = false;
        $scope.isEditionSet = false;

        //added on each page to set properties to player
        $scope.params = {lieu: "none"};
        $rootScope.params = {lieu: "none"};

        $scope.info = {
            isAppInit: false,
            user: {}
        };

        //retrieve user
        userFactory.getMe()
            .catch(e => {
                $scope.info.user = 'guest';
                console.info(`Welcome to Hens World v${hensApp.version}! The site is still en alpha, you may find some bugs. :)`);
            })
            .then($scope.displayMe)
            .catch(e => {
                console.error("error during profile initialization: ", e);
            });

        $rootScope.addNewMessage = function (subject) {
            if (!$rootScope.newMessages.find(message => message.id === subject.id)) {
                return $rootScope.newMessages.push(subject);
            }
        };

        $rootScope.setSubjectSeen = function (subject) {
            const idx = $rootScope.newMessages.findIndex(message => message.id === subject.id);
            if (idx >= 0) {
                return $rootScope.newMessages.splice(idx, 1);
            }
        };

        $scope.newNotif = function (notif) {
            $rootScope.$broadcast('notif:new', notif);
        };

        window.addEventListener('click', (event) => {
            if (!event.target.closest('notif-elt') && !event.target.closest('notif-list') &&
                !event.target.closest('notif-bt')) {
                if ($scope.showNotifList) $scope.toggleNotif();
            }
        });

        $scope.$watch('info.user', function (newValue, oldValue) {
            if (newValue !== undefined && newValue.ID !== undefined) {
                hensApp.u = $scope.info.user;
                if (newValue.village == void 0) {
                    return $scope.newNotif({
                        nid: -1,
                        message: 'Le monde de Hens vous attends! Venez choisir votre village.',
                        command_key: 'link',
                        command_value: 'choix-village'
                    });
                } else if (newValue.pouvoir == void 0) {
                    return $scope.newNotif({
                        nid: -1,
                        message: 'Venez remplir un questionnaire pour obtenir votre pouvoir!',
                        command_key: 'link',
                        command_value: `questionnaire/1`
                    });
                }
            }
        });
    }
])
