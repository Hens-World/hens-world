angular.module('app').component('profileTabs', {
    templateUrl: myLocalized.partials + 'profileTabs.html',
    bindings: {
        personnageList: '=',
    },
    controllerAs: 'pTabCtrl',
    controller: [
        '$scope', '$element', '$rootScope', function ($scope, $element, $rootScope) {

            this.$onChanges = (changes) => {
                if (changes.personnageList) {
                    this.filteredPersonnageList = this.personnageList.filter(p => p.prenom || $scope.isMe);
                }
            }

            this.$onInit = () => {
                if (this.personnageList) {
                    this.filteredPersonnageList = this.personnageList.filter(p => p.prenom || $scope.isMe);
                }
            };

            $scope.$parent.$parent.$watch('isMe', (n) => $scope.isMe = n);
            $scope.$parent.$parent.$watch('personnage', (n) => $scope.personnage = n);
            $scope.$parent.$parent.$watch('currentRole', (n) => $scope.currentRole = n);
            $scope.$parent.$parent.$watch('showProfil', (n) => $scope.showProfil = n);
            $scope.$parent.$parent.$watch('user', (n) => $scope.user = n);

            $scope.switchToCharacter = () => {
                $scope.$emit("switchToCharacter");
            };

            $scope.switchToAccount = () => {
                $scope.$emit("switchToAccount");
            };
        }
    ]
});