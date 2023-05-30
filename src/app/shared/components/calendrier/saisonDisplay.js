const icons_per_season = ["hiver", "printemps", "ete", "automne"];
const season_article = ["l'", "le ", "l'", "l'"];
angular.module('app').component("saisonDisplay", {
    templateUrl: myLocalized.partials + "saisonDisplay.html",
    controller: ['$scope', '$element', '$rootScope', 'localeFactory', function ($scope, $element, $rootScope, localeFactory) {
        this.$onInit = () => {
            const season_index = hensApp.getSeasonIndex(moment());
            this.season = hensApp.c.seasons[season_index];
            this.article = season_article[season_index];
            this.icon_container = $element[0].querySelector(".saison-display__icon");
            lottie.loadAnimation({
                container: this.icon_container,
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: `/medias/events/saisons/${icons_per_season[season_index]}_icon.json`
            });
        }
    }]
})