class ProfileShared {
  constructor($scope, $rootScope, $routeParams, $location, userFactory) {
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$routeParams = $routeParams;
    this.$location = $location;
    this.userFactory = userFactory;

    this.labels = {
      contrib: [
        'Contributeur.trice', 'Contributeur', 'Contributrice'
      ],
      membre: [
        'Membre', 'Membre', 'Membre'
      ]
    };
    $scope.closePouvoir = () => $scope.displayPouvoirDescr = false;

    $rootScope.$on('profilePronom:update', (event, pronom) => {
      $scope.user.pronom = pronom;
      this.setRole();
    });

    $scope.$watch('info.user', function (newValue, oldValue) {
      if ($scope.info.user.ID === parseInt($routeParams.id)) {
        $scope.isMe = true;
      }
    });

    this.setRole = () => {
      if ($scope.user) {
        const pronom = !isNaN($scope.user.pronom) ? $scope.user.pronom : 0;
        if ($scope.user.role === "membre") {
          $scope.currentRole = this.labels.membre[pronom];
        } else {
          $scope.currentRole = this.labels.contrib[pronom];
        }
      }
    };

    this.switchToCharacter = () => {
      if ($scope.personnage || $scope.isMe) {
        $scope.showProfil = false;
      }
    };

    this.switchToAccount = () => {
      if (this.$scope.personnage || $scope.isMe) {
        $scope.showProfil = !$scope.showProfil;
      }
    };

    this.initProfile = (data)=> {
      this.$scope.user = data.data;
      this.$scope.shared.setRole();
      this.userFactory.getCharacters($scope.user.ID).then((data) => {
        this.$scope.persoList = data.data;
        this.$scope.personnage = this.$scope.persoList[0];
        if (this.$scope.personnage) {
          this.$scope.personnage.prenomFormat = $scope.personnage.prenom.replace("'", '-');
        }
        //init reroutes
        let char_index = parseInt(this.$location.search().character);
        if (!isNaN(char_index) && char_index <= 3 && this.$scope.persoList.length >= char_index) {
          this.$scope.personnage = this.$scope.persoList.find(p=> p.char_index === char_index);
          this.switchToCharacter();
        }
        if (this.$location.search().tab && ($location.search().tab === 'char')) {
          this.switchToCharacter();
        }
      }).catch(this.$rootScope.handleError);
      this.$scope.isMe = this.$scope.user.ID === parseInt(this.$rootScope.currentUser.ID);
      this.$scope.$parent.info.isAppInit = true;
    };

    $scope.$on('switchToCharacter', this.switchToCharacter);
    $scope.$on('switchToAccount', this.switchToAccount);

  }

}