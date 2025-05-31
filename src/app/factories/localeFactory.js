hensApp.factory('localeFactory', ['$http', '$rootScope', function ($http, $rootScope) {
    return {
        JSON(jsonUrl, noversion) {
            let url;
            if (noversion) {
                url = `${myLocalized.medias}${jsonUrl}.json`;
            } else {
                url = `${myLocalized.json}${jsonUrl}.json`;
            }
            return $http.get(url);
        },
        mediasJSON(jsonUrl) {
            let url;
            url = `${myLocalized.medias}${jsonUrl}.json`;
            return $http.get(url);

        },
        html(htmlUrl) {
            const url = `${myLocalized.partials}${htmlUrl}.html`;
            return $http.get(url);
        }
    };
}
]);