
angular.module('app').component('domaineCheftain', {
    templateUrl: myLocalized.partials + 'domaineCheftain.html',
    controllerAs: 'ctrl',
    bindings: {
        type: '@'
    },
    controller: [
        '$scope', '$element', '$rootScope', 'eventsFactory', 'userFactory', 'socket',
        function ($scope, $element, $rootScope, eventsFactory, userFactory, socket) {
        }
    ]
});