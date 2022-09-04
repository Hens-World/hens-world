angular.module('app').component('seriesList', {
  templateUrl: myLocalized.partials + 'serieList.html',
  bindings: {
    status: "@"
  },
  controllerAs: 'ctrl',
  controller: [
    '$scope', '$element', '$rootScope', 'seriesFactory', function ($scope, $element, $rootScope, seriesFactory) {
      this.editSerie = (serie) => {
        console.log('send start serie create');
        $rootScope.$emit('startSerieCreation', serie);
      };

      this.deleteSerie = (serie) => {
        $rootScope.$emit('modal:set', {
          title: 'Supprimer une Série de créations',
          text: `Voulez vous vraiment supprimer la Série de créations \"${serie.title}\" ?`,
          validation: () => {
            seriesFactory.deleteSerie(serie.id).then(() => {
              $rootScope.setAlert('success', `Votre Série de créations "${serie.title}" a bien été supprimée.`);
              this.getSeries();
            }).catch($rootScope.handleError);
          }
        });
      }

      this.getSeries = () => {
        console.log("SUTAUTUSUU", this.status);
        if (this.status === "draft") {
          seriesFactory.getMyDrafts().then(data => {
            this.series = data.data;
          }).catch($rootScope.handleError);
        } else {
          seriesFactory.getMySeries().then(data => {
            this.series = data.data;
          }).catch($rootScope.handleError);

        }
      }

      this.$onInit = () => {
        $scope.$on('requestUpdateSeries', () => {
          this.getSeries();
        });
        this.getSeries();

      };
    }
  ]
});