angular.module('app').component('bibliothequeMedia', {
  templateUrl: myLocalized.partials + 'mediaList.html',
  bindings: {
    callback: '<',
    isHidden: '<'
  },
  controllerAs: 'libraryCtrl',
  controller: [
    '$scope', '$element', '$rootScope', 'mediaFactory', function ($scope, $element, $rootScope, mediaFactory) {
      this.rawFile = null;

      this.$onChanges = (changes) => {
        console.log('changes', changes);
        if (!this.isHidden) {
          setTimeout(() => {
            this.onAllImagesLoaded();
          });
        }
      };

      this.$onInit = () => {
        window.addEventListener('resize', this.debounceAllImagesLoaded);
        $rootScope.$on('media-upload:progress', (event, value) => {
          this.uploadPercent = value;
        })
      };

      this.$onDestroy = () => {
        window.removeEventListener('resize', this.debounceAllImagesLoaded);
      };

      this.prepareImage = function (media) {
        const imageSrc = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'ico'];
        let ok = false;
        for (let src of imageSrc) {
          if (media.url.indexOf(`.${src}`) > -1) {
            ok = true;
            break;
          }
        }
        if (!ok) {
          return myLocalized.medias + 'common/file.png';
        } else {
          return media.url;
        }
      };

      this.finishLoading = function () {
        this.loading = false;
        $rootScope.setAlert('success', 'Mise en ligne réussie');
        $('input.link').first().select();
        $('.bibliotheque-media-container').animate({scrollTop: 200}, 450);
        this.debounceAllImagesLoaded();
      };

      this.init = () => {
        mediaFactory.getMedia().then((res) => {
          this.mediaList = res.data;
          const result = [];
          var media;
          for (let index = 0; index < this.mediaList.length; index++) {
            media = this.mediaList[index];
            media.title = media.name;
            media.image = this.prepareImage(media);
            let loadImage = new Image();
            loadImage.addEventListener('load', this.checkAllImageLoaded);
            loadImage.src = media.image;
          }
        });
      };

      this.loadedImages = 0;
      this.checkAllImageLoaded = (e) => {
        this.loadedImages++;
        this.debounceAllImagesLoaded();
      };

      let imageLoadedTimeoutId;
      this.debounceAllImagesLoaded = () => {
        if (imageLoadedTimeoutId != null) clearTimeout(imageLoadedTimeoutId);
        imageLoadedTimeoutId = setTimeout(this.onAllImagesLoaded, 50);
      };

      this.onImageLoad = ()=>{
        this.debounceAllImagesLoaded();
      };

      this.onAllImagesLoaded = () => {
        if (this.isHidden) return;
        let lowestChild;
        let mediaList = document.querySelector('.media-list');
        mediaList.style.setProperty("--columns", window.innerWidth >= 800 ? "3" : "2");
        mediaList.classList.toggle('mobile', window.innerWidth < 800);
        mediaList.style.setProperty('--mediaListHeight', null);
        void mediaList.offsetWidth;
        Array.from(mediaList.children).forEach(mediaElement => {
          if (!lowestChild || lowestChild.getBoundingClientRect().bottom <
            mediaElement.getBoundingClientRect().bottom) {
            lowestChild = mediaElement;
          }
        });
        mediaList.style.setProperty('--mediaListHeight', 20 + lowestChild.getBoundingClientRect().bottom -
          mediaList.getBoundingClientRect().top + "px");
      };

      if ($rootScope.currentUser) {
        this.init();
      } else {
        $rootScope.$watch('currentUser', (n, o) => {
          if (n && n !== o) {
            this.init();
          }
        });
      }

      this.uploadFile = () => {
        if (!this.rawFile) {
          return $rootScope.setAlert('error', 'Aucun fichier n\'est choisi.');
        }
        this.loading = true;
        mediaFactory.postMedia(this.rawFile).then((res) => {
          this.rawFile = null;
          res.data.image = this.prepareImage(res.data);
          res.data.title = res.data.name;
          this.mediaList.unshift(res.data);
          this.finishLoading();
        }).catch($rootScope.handleError)
      };

      this.selectMedia = (media) => {
        if (this.callback) {
          this.selectedMedia = media;
        }
      };

      this.sendMedia = () => {
        if (this.callback) {
          this.callback(this.selectedMedia);
        }
      };

      this.deleteMedia = (media) => {
        $rootScope.$emit('modal:set', {
          title: 'Supprimer un média',
          text: `Voulez vous vraiment supprimer votre media "${media.title}" ?`,
          validation: () => {
            mediaFactory.deleteMedia(media.id).then((res) => {
              let removedIndex = this.mediaList.findIndex((existingMedia) => existingMedia.id === media.id);
              this.mediaList.splice(removedIndex, 1);
              $rootScope.setAlert('success', `Vous avez bien supprimé le media "${media.title}" !`);
            }).catch($rootScope.handleError);
          }
        });
      };

      this.toggleEditMediaName = (media) => {
        if (media) {
          media.editingTitle = media.title;
        }
        if (this.editingMedia) {
          this.editingMedia = null;
        } else {
          this.editingMedia = media;
        }
      };

      this.editMediaName = (media) => {
        mediaFactory.editMedia({
          id: media.id,
          title: media.editingTitle
        }).then((res) => {
          media.title = res.data.name;
          $rootScope.setAlert('success', "Le nom du media a bien été modifié !");
        }).catch((e) => {
          $rootScope.handleError(e);
        });
        this.toggleEditMediaName(null);
      };


    }
  ]
})
  .directive('imageLoadWatcher', [
    '$rootScope', ($rootScope) => ({
      restrict: 'A',
      scope: {
        onLoad: '='
      },
      controller($scope, $element) {
        $scope.elt = $element[0];

        $scope.checkSize = ()=>{
          if ($scope.elt.offsetHeight > 0) {
            $scope.onLoad();
            clearInterval($scope.interval);
          }
        };
        $scope.interval = setInterval($scope.checkSize, 16);
      }
    })
  ]);