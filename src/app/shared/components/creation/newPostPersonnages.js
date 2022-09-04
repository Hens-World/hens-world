angular.module('app').component('newPostPersonnages', {
  templateUrl: myLocalized.partials + 'newPostPersonnages.html',
  bindings: {
    personnagesLies: '=',
    fastSearch: '='
  },
  controllerAs: 'nPPCtrl',
  controller: [
    '$scope', '$element', 'userFactory', '$rootScope', function ($scope, $element, userFactory, $rootScope) {

      this.villages = ['sulimo', 'ulmo', 'wilwar', 'anar'];
      this.$onInit = () => {
        if (this.fastSearch) {
          this.hideDescr = true;
          this.absoluteList = true;
          this.startNewPersonnageSearch();
        }
        if (!this.personnagesLies) this.personnagesLies = [];
      };
      this.startNewPersonnageSearch = () => {
        this.isSearchingPersonnage = true;
      };

      this.validatePersonnage = (personnageToAdd) => {
        this.personnagesLies.push(personnageToAdd);
        this.personnageNameFilter = null;
        this.searchPersonnageList = [];
      };

      this.removePersonnage = (personnageToDel) => {
        const personnage = this.personnagesLies.findIndex(personnage => personnageToDel.fid === personnage.fid);
        this.personnagesLies.splice(personnage, 1);
      };

      //INIT ----
      this.onFilterChange = (input) => {
        if (input.length > 2) {
          userFactory.searchCharacters(input).then((res) => {
            let characters = res.data;
            this.searchPersonnageList = characters.map((personnage) => {
              this.scoreName(input, personnage);
              return personnage;
            }).sort((a, b) => {
              if (a.score < b.score) return -1; else if (a.score > b.score) return 1; else return 0;
            }).splice(0, 4);
          }).catch($rootScope.handleError)
        }
      };

      /**
       * the lowest the score, the better
       * @param input the search input
       * @param name the name to score
       */
      this.scoreName = (input, personnage) => {
        let f = input.toLowerCase();
        let fail = false;
        let lowerName = personnage.prenom.toLowerCase(); // temporary personnage name
        let selecName = [];
        for (var letter of Array.from(f)) {
          letter = letter.toLowerCase();
          if (lowerName.indexOf(letter) === -1) {
            fail = true;
          }
          lowerName =
            lowerName.slice(0, lowerName.indexOf(letter)) +
            lowerName.slice(lowerName.indexOf(letter) + 1, lowerName.length);
        }
        if (!fail) {
          for (letter of Array.from(personnage.prenom)) {
            letter = letter.toLowerCase();
            if (f.indexOf(letter) > -1) {
              selecName.push({
                letter,
                selected: true
              });
              f = f.slice(0, f.indexOf(letter)) + f.slice(f.indexOf(letter) + 1, f.length);
            } else {
              selecName.push({
                letter,
                selected: false
              });
            }
          }
        }
        personnage.selecName = selecName;
        let score = 0;
        let distance = 0;
        selecName.forEach((letter, index) => {
          if (letter.selected) {
            score += distance;
            distance = 0;
          } else {
            distance++;
          }
        });
        personnage.score = score;
      };
    }
  ]
});
