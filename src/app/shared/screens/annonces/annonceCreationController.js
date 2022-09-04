/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('annonceCreation', ['$scope', '$rootScope', 'annoncesFactory', '$location', '$routeParams', function ($scope, $rootScope, annoncesFactory, $location, $routeParams) {
    $scope.$parent.info.isAppInit = false;
    console.log('creation init!');
    $scope.locations = [
        ['village', 'falaise', 'forêt', 'marais'],
        ['village', 'montagne', 'collines', 'souterrains'],
        ['village', 'champs', 'bois', 'rivière'],
        ['village', 'mer', 'lac', 'prairie'],
    ];
    $scope.showLocations = false;
    $scope.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];
    $scope.resetAnnonce = () =>
        $scope.annonce = {
            title: '',
            rawKeywords: '',
            description: '',
            participants: 5,
            inviteList: [],
            is_private: false
        }
    ;
    if (!$routeParams.id) {
        $scope.resetAnnonce();
        $scope.$parent.info.isAppInit = true;
    } else {
        annoncesFactory.getById($routeParams.id).then(function (result) {
            $scope.annonce = result.data;
            $scope.annonce.participants = $scope.annonce.limit_size;
            if ($scope.annonce.village === -1) {
                $scope.annonce.hasLocation = false;
            } else {
                $scope.annonce.hasLocation = true;
                $scope.setLocation($scope.annonce.location, $scope.annonce.village);
            }
            if (+new Date($scope.annonce.start_time) > 0) {
                $scope.annonce.hasDate = true;
                $scope.annonce.date = new Date($scope.annonce.start_time);
            }
            return $scope.$parent.info.isAppInit = true;
        });
    }

    $scope.ph = {
        description: "Décrivez en quelques mots si vous avez des idées de context, de profils particuliers que vous recherchez pour jouer, si vous souhaitez reprendre le contexte d'une création etc..."
    };
    $scope.getInviteIds = function (list) {
        const idList = [];
        for (let user of Array.from(list)) {
            idList.push(user.ID);
        }
        return idList;
    };
    $scope.sliderOpt = {
        participants: {
            floor: 2,
            ceil: 20
        }
    };
    $scope.computeKeywords = function (keywords) {
        const list = [];
        const unsafeList = keywords.split(',');
        for (let unsafeWord of Array.from(unsafeList)) {
            list.push(unsafeWord.trim());
        }
        return list;
    };

    $scope.handleLocationShow = function (e) {
        console.log($('#location-input:focus').length, $('#location-input').length);
        if (($('#location-input:focus').length === 1) && ($scope.showLocations === false)) {
            $scope.showLocations = true;
        } else if ($('#location-input:focus').length === 0) {
            $scope.showLocations = true;
        }
    };
    $scope.setLocation = function (locationIndex, villageIndex) {
        $scope.annonce.lieu = $scope.locations[villageIndex][locationIndex];
        $scope.formatLieu = $scope.villages[villageIndex].capitalizeFirstLetter();
        $scope.formatLieu += `, ${$scope.locations[villageIndex][locationIndex].capitalizeFirstLetter()}`;
        $scope.annonce.village = villageIndex;
        $scope.annonce.location = locationIndex;
        return $scope.showLocations = false;
    };

    $scope.isAnnonceValid = function (annonce) {
        if (!annonce.title || (annonce.title.trim().length < 3)) {
            $rootScope.setAlert('error', 'annonce_short_title');
            return false;
        } else if (!annonce.description || (annonce.description.trim().length < 10)) {
            $rootScope.setAlert('error', 'annonce_short_desc');
            return false;
        } else if (annonce.date && moment(annonce.date).isBefore(moment())) {
            $rootScope.setAlert('error', 'date_past');
            return false;
        }
        return true;
    };
    $scope.annoncesManager = annoncesFactory;
    return $scope.createAnnonce = function () {
        if ($scope.isAnnonceValid($scope.annonce)) {
            if (!$scope.annonce.hasLocation) {
                $scope.annonce.village = -1;
                $scope.annonce.location = -1;
            }
            if ($scope.annonce.aid) {
                $scope.annoncesManager.edit($scope.annonce.aid, $scope.annonce).then(function (result) {
                    $rootScope.setAlert('success', "annonce_edit");
                    return $location.path(`/annonces/${result.data.id}`);
                }).catch($rootScope.handleError);

            } else {
                // $scope.annonce.keywords =  $scope.computeKeywords($scope.annonce.rawKeywords)
                $scope.annonce.inviteList = $scope.getInviteIds($scope.annonce.inviteList);
                $scope.annoncesManager.create($scope.annonce).then(function (result) {
                    $rootScope.setAlert('success', "annonce_create");
                    $location.path(`/annonces/${result.data.id}`);
                }).catch($rootScope.handleError);
            }
            return $scope.resetAnnonce();
        }
    };
}


]);
