angular.module('app').component('profileCompteSideMenu', {
    templateUrl: myLocalized.partials + 'profileCompteSideMenu.html',
    controllerAs: 'ctrl',
    bindings: {},
    controller: ['$scope', '$element', '$rootScope', '$routeParams', 'seriesFactory',
        function ($scope, $element, $rootScope, $routeParams, seriesFactory) {
            this.$onInit = () => {
                this.menuList = [
                    {
                        label: "Résumé du profil",
                        tag: "resume"
                    }, {
                        label: "Créations postées",
                        tag: "creations"
                    }, {
                        label: "Séries de créations",
                        tag: "series"
                    }
                ];
                this.state = this.menuList[0];


                console.log(this.menuList)
                //find out if stuff is available: 
                this.menuList.find((button) => button.tag === "resume").available = true;
                this.menuList.find((button) => button.tag === "creations").available = true;

                seriesFactory.getSeriesByUserId(parseInt($routeParams.id)).then((data) => {
                    this.menuList.find((button) => {
                        return button.tag === "series";
                    }).available = data.data.length > 0;
                    console.log("hu ?", data, this.menuList);

                });
            };


            $rootScope.$on('compte-side-menu:update', (event, btn) => {
                this.state = btn;
            });

            $rootScope.$on('compte-side-menu:request', (event, btn) => {
                $rootScope.$broadcast('compte-side-menu:set', this.state);
            });

            this.menuClick = (btn) => {
                this.state = btn;
                $rootScope.$broadcast('compte-side-menu:set', btn);
            };
        }
    ]
});