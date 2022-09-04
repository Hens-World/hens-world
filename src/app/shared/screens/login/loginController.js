angular.module('app').controller('Login', [
    '$scope', '$rootScope', '$location', 'accountFactory', 'formFactory',
    function ($scope, $rootScope, $location, accountFactory, formFactory) {
        $scope.$parent.info.isAppInit = false;
        $rootScope.$emit('bottomNav:select', "Connexion");
        if ($rootScope.currentUser) {
            $location.path('map');
        }
        $rootScope.$watch('currentUser', (n, o) => {
            if (n) {
                if (window.mobilecheck()) {
                    $location.path('navbar');

                } else {
                    $location.path('map');
                }
            }
        });

        $scope.$parent.info.isAppInit = true;

        $scope.loginForm = {
            accountName: null,
            password: null,
        };

        $scope.login = () => {
            accountFactory.login($scope.loginForm.accountName, $scope.loginForm.password).then(function (data) {
                location.reload();
            }).catch(e=>{
                $rootScope.$emit(HEADER_EVENTS.ERROR);
            });
        };
    }
]);