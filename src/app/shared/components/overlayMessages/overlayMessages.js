hensApp.directive('overlayMessages', [
    '$rootScope', 'eventsFactory', "$location", function ($rootScope, eventsFactory, $location) {
        return {
            restrict: 'A',
            templateUrl: myLocalized.partials + 'overlayMessages.html',
            scope: {},
            controller($scope, $element) {
                let readMessages;
                $scope.hidden = true;
                $scope.messages = [
                    // {
                    //   tag: 'inclusive',
                    //   range: ['10-11', '17-11'],
                    // },
                    // {
                    //   tag: 'mobileOrEvent',
                    //   range: ['20-04', '15-05']
                    // }
                    // {
                    //   tag: 'anarElection',
                    //   range: ['15-08', '29-08']
                    // },
                ];

                $scope.currentMessage = $scope.messages.find(message => {
                    return hensApp.isTodayBetween(hensApp.parseDate(message.range[0]), hensApp.parseDate(message.range[1]));
                });
                if (!$scope.currentMessage) {
                    eventsFactory.getCurrentEvent().then(data => {
                        let currentEvent = data.data;
                        if (currentEvent && currentEvent.slug !== "lanterne_readonly") {
                            $scope.currentMessage = {
                                tag: currentEvent.slug,
                                type: 'event'
                            };
                            console.log($scope.currentMessage)
                        }
                        $scope.displayMessage();
                    });
                }
                else {
                    $scope.displayMessage();
                }

                $scope.displayMessage = () => {
                    let readMessagesData = localStorage.getItem('overlay_read');
                    if (readMessagesData == null) {
                        $scope.hidden = !$scope.currentMessage;
                    } else {
                        readMessages = JSON.parse(readMessagesData);
                        $scope.hidden =
                            !$scope.currentMessage || !!readMessages.find(readMessage => {
                                return readMessage.tag === $scope.currentMessage.tag && moment(readMessage.date).year() === moment().year()
                            });
                    }
                };

                $scope.closeOverlay = () => {
                    let readMessagesData = localStorage.getItem('overlay_read');
                    readMessages = (readMessagesData != null) ? JSON.parse(readMessagesData) : [];
                    if (!readMessages.find(readMessage => readMessage.tag === $scope.currentMessage.tag && moment(readMessage.date).year() === moment().year())) {
                        readMessages.push(Object.assign({ date: +new Date() }, $scope.currentMessage));
                        localStorage.setItem('overlay_read', JSON.stringify(readMessages));
                    }
                    $scope.hidden = true;
                };

                $scope.goToIrlForm = () => {
                    $scope.closeOverlay();
                    $location.path("/events/irl-form");
                };
            }
        }
    }
]);
