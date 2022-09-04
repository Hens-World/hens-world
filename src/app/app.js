window.wp = window.wp || {};
window.devBase = "";

hensApp.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    /*
      GENERAL
    */
    $routeProvider.when(window.devBase + '/', {
        templateUrl: myLocalized.specPartials + 'home.html',
        controller: 'Home'
    }).when(window.devBase + '/inscription', {
        templateUrl: myLocalized.partials + 'inscription.html',
        controller: 'Inscription'
    }).when(window.devBase + '/login', {
        templateUrl: myLocalized.partials + 'login.html',
        controller: 'Login'
    }).when(window.devBase + '/map', {
        templateUrl: myLocalized.specPartials + 'map.html',
        controller: 'Map'
    }).when(window.devBase + '/map/:village/:zone/:location/int', {
        templateUrl: myLocalized.partials + 'mapInterior.html',
        controller: 'MapInterior'
    }).when(window.devBase + '/map/:village/:zone', {
        templateUrl: myLocalized.specPartials + 'village.html',
        controller: 'Village'
    })
    .when(window.devBase + '/map/:village/:zone/:location', {
        templateUrl: myLocalized.specPartials + 'village.html',
        controller: 'Village'
    })
    .when(window.devBase + '/profil/:id', {
        templateUrl: myLocalized.specPartials + 'profile.html',
        controller: 'Profil'
    })
    .when(window.devBase + '/profil/:id/series/:serieid', {
        templateUrl: myLocalized.partials + 'serieDetail.html',
        controller: 'SerieDetail'
    })
    .when(window.devBase + '/choix-village', {
        templateUrl: myLocalized.partials + 'choixVillage.html',
        controller: 'ChoixVillage'
    })
    .when(window.devBase + '/choix-village/personnage/:cid', {
        templateUrl: myLocalized.partials + 'choixVillage.html',
        controller: 'ChoixVillage'
    })
    .when(window.devBase + '/choix-village/personnage/:cid/:village', {
        templateUrl: myLocalized.partials + 'choixVillage.html',
        controller: 'ChoixVillage'
    })
    .when(window.devBase + '/choix-village/:village', {
        templateUrl: myLocalized.partials + 'choixVillage.html',
        controller: 'ChoixVillage'
    })
    .when(window.devBase + '/questionnaire/:cid', {
        templateUrl: myLocalized.partials + 'questionnaire.html',
        controller: 'QCM'
    })
    .when(window.devBase + '/questionnaire-test', {
        templateUrl: myLocalized.partials + 'questionnaire-test.html',
        controller: 'QCMTest'
    })
    .when(window.devBase + '/reglement', {
        templateUrl: myLocalized.partials + 'reglement.html',
        controller: 'faq'
    })
    .when(window.devBase + '/faq', {
        templateUrl: myLocalized.partials + 'faq.html',
        controller: 'faq'
    }).when(window.devBase + '/messagerie', {
    templateUrl: myLocalized.partials + 'whisperList.html',
    controller: 'WhisperList'
    }).when(window.devBase + '/messagerie/new', {
        templateUrl: myLocalized.partials + 'whisperCreate.html',
        controller: 'WhisperCreate'
    }).when(window.devBase + '/messagerie/:id', {
        templateUrl: myLocalized.partials + 'whisperElement.html',
        controller: 'WhisperElement'
    }).when(window.devBase + '/tchat', {
        templateUrl: myLocalized.partials + 'chat.html',
        controller: 'ChatController'
    }).when(window.devBase + '/article/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/recit/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/jeux_videos/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/legende/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/images/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/videos/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/photos/:slug', {
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/musiques/:slug', { //#article end
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/profil/:userid/series/:seriesid/:type/:slug', { //#article end
        templateUrl: myLocalized.partials + 'content.html',
        controller: 'Content'
    }).when(window.devBase + '/panneau-creation', {
        templateUrl: myLocalized.partials + 'panneauCreation.html',
        controller: 'panneauCreation'
    }).when(window.devBase + '/bibliotheque-media', {
        templateUrl: myLocalized.partials + 'bibliothequeMedia.html',
        controller: 'bibliothequeMediaCtrl'
    }).when(window.devBase + '/page-don', {
        templateUrl: myLocalized.partials + 'pageDon.html',
        controller: 'pageDon'
    }).when(window.devBase + '/autour-de-hens', {
        templateUrl: myLocalized.partials + 'autourDeHens.html',
        controller: 'autourDeHens'
    }).when(window.devBase + '/population', {
        templateUrl: myLocalized.partials + 'population.html',
        controller: 'Population'
    }).when(window.devBase + '/guide-touristique', {
        templateUrl: myLocalized.partials + 'guideTouristique.html',
        controller: 'GuideTouristique'
    }).when(window.devBase + '/guide-touristique/calendrier', {
        templateUrl: myLocalized.partials + 'calendrier.html',
        controller: 'Calendrier'
    }).when(window.devBase + '/guide-touristique/visite-guidee', {
        templateUrl: myLocalized.partials + 'visiteGuidee.html',
        controller: 'visiteGuidee'
    }).when(window.devBase + '/roleplay/chat', {
        templateUrl: myLocalized.partials + 'chatRpHome.html',
        controller: 'chatRpHome'
    }).when(window.devBase + '/roleplay/archives', {
        templateUrl: myLocalized.partials + 'chatRpArchiveList.html',
        controller: 'chatRpArchiveList'
    }).when(window.devBase + '/roleplay/archives/:type/:id', {
        templateUrl: myLocalized.partials + 'chatRpArchive.html',
        controller: 'chatRpArchive'
    }).when(window.devBase + '/roleplay/create-type', {
        templateUrl: myLocalized.partials + 'roleplayCreateType.html',
        controller: 'roleplayCreateType'
    }).when(window.devBase + '/roleplay/differe/', {
        templateUrl: myLocalized.partials + 'roleplayAsync.html',
        controller: 'roleplayAsyncHome'
    }).when(window.devBase + '/roleplay/differe/:id', {
        templateUrl: myLocalized.partials + 'asyncDetail.html',
        controller: 'AsyncDetail'
    }).when(window.devBase + '/roleplay/chat/room/:roomid', {
        templateUrl: myLocalized.partials + 'chatRpHome.html',
        controller: 'chatRpHome'
    }).when(window.devBase + '/annonces', {
        templateUrl: myLocalized.partials + 'annnoncesCtrl.html',
        controller: 'annonces'
    }).when(window.devBase + '/annonces/new', {
        templateUrl: myLocalized.partials + 'annonceCreation.html',
        controller: 'annonceCreation'
    }).when(window.devBase + '/annonces/:id', {
        templateUrl: myLocalized.partials + 'annonceDetail.html',
        controller: 'annonceDetail'
    }).when(window.devBase + '/annonces/:id/edit', {
        templateUrl: myLocalized.partials + 'annonceCreation.html',
        controller: 'annonceCreation'
    }).when(window.devBase + '/constellations', {
        templateUrl: myLocalized.partials + 'constellations.html',
        controller: 'constellations'
    }).when(window.devBase + '/signup-confirm', {
        templateUrl: myLocalized.partials + 'signupConfirm.html',
        controller: 'signupConfirm'
    }).when(window.devBase + '/reset-password', {
        templateUrl: myLocalized.partials + 'resetPassword.html',
        controller: 'resetPassword'
    }).when(window.devBase + '/parameters', {
        templateUrl: myLocalized.partials + 'parameters.html',
        controller: 'Parameters'
    }).when(window.devBase + '/dialogues/:character', {
        templateUrl: myLocalized.partials + 'dialogue.html',
        controller: 'Dialogue'
    }).when(window.devBase + '/signe-zodiaque/', {
        templateUrl: myLocalized.partials + 'signeZodiaque.html',
        controller: 'SigneZodiaque'
    }).when(window.devBase + '/admin', {
        templateUrl: myLocalized.partials + 'index.html',
        controller: 'Admin'
    }).when(window.devBase + '/events/equinoxe-printemps/', {
        templateUrl: myLocalized.partials + 'wilwarField.html',
        controller: 'WilwarField'
    }).when(window.devBase + '/events/aulne-papier/', {
        templateUrl: myLocalized.partials + 'aulnePapier.html',
        controller: 'AulnePapier'
    }).when(window.devBase + '/events/carnaval-cachette/', {
        templateUrl: myLocalized.partials + 'carnavalCachette.html',
        controller: 'CarnavalCachette'
    }).when(window.devBase + '/events/coupe-crushrun/', {
        templateUrl: myLocalized.partials + 'crushrunDownload.html',
        controller: 'CrushrunDownload'
    }).when(window.devBase + '/events/map/:eventname/:village/:zone/', {
        templateUrl: myLocalized.specPartials + 'village.html',
        controller: 'Village'
    }).when(window.devBase + '/events/solstice-ulmo/', {
        templateUrl: myLocalized.partials + 'solsticeUlmo.html',
        controller: 'SolsticeUlmo'
    })
        .when(window.devBase + '/navbar', {
            templateUrl: myLocalized.specPartials + 'navbarPage.html',
            controller: 'NavbarPage'
        })
        .otherwise({
            templateUrl: myLocalized.specPartials + 'home.html',
            controller: 'Home'
        });
    hensApp.registration = globalRegistration;

}).directive('onLastRepeat', () => function (scope, element, attrs) {
    if (scope.$last) {
        return setTimeout(() => scope.$emit('onRepeatLast', element, attrs), 1);
    }
});

hensApp.filter('capitalize', () => function (input) {
    if (!!input) {
        return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
    } else {
        return '';
    }
});
