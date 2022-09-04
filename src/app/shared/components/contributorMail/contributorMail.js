/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('contributorMail', ['$http', 'localeFactory', 'socket', 'accountFactory', '$rootScope',
    ($http, localeFactory, socket, accountFactory, $rootScope) =>
        ({
            restrict: 'A',
            templateUrl: myLocalized.partials + 'contributorMail.html',
            controller($scope, $element) {
                $scope.mail = {
                };
                $scope.showCharte = false;

                $scope.closeContrib = () => {
                    $scope.displaySignup = false;
                };

                $scope.sendMail = function (a) {
                    accountFactory.askContributorAccess(a).then(()=>{
                        $rootScope.setAlert("success", "Votre demande a été envoyée !");
                    }).catch($rootScope.handleError);
                    $scope.displaySignup = false;
                };

                localeFactory.JSON('qevLabel').then(res => $scope.content = res.data);
                $scope.toggleCharte = function () {
                    let tl;
                    if ($scope.showCharte) {
                        tl = new TimelineLite();
                        tl.to($('.charte-container').find('div'), 0.5,
                            {opacity: 0});

                    } else {
                        tl = new TimelineLite();
                        tl.set($('.charte-container'),
                            {transform: 'scale(0,0.1)'});
                        // tl.to $('.charte-container')
                        tl.to($('.charte-container'), 0.5,
                            {transform: 'scale(1,0.1)'});
                        tl.to($('.charte-container'), 0.5,
                            {transform: 'scale(1,1)'});
                        tl.to($('.charte-container').find('div'), 0.5,
                            {opacity: 1});
                    }
                    $scope.showCharte = !$scope.showCharte;
                };
            }
        })

]);
