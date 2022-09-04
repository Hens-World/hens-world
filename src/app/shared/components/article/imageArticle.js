hensApp.directive('imageArticle', ['$compile', 'userFactory', '$sce', ($compile, userFactory, $sce) =>
  ({
    restrict: 'A',
    templateUrl: myLocalized.partials + 'imageArticle.html',
    scope: {
      post: '=',
      user: '=',
      isFav: '='
    },
    controller($scope, $element) {
      let post;
      $scope.trust = string => $sce.trustAsHtml(string);
      $scope.tempLoader = {};
      $scope.iteration = 0;
      $scope.storeImgWidth = 0;
      $scope.storeImgHeight = 0;
      $scope.userManager = userFactory;
      $scope.uiElement = document.querySelector('.ui');
      $scope.imageList = document.querySelector('.img-list');
      $scope.imageListWrapper = document.querySelector('.img-list-wrapper');

      $scope.touchStartPosX = null;
      $scope.uiElement.addEventListener("touchstart", (e)=>{
        $scope.touchStartPosX = e.touches[0].pageX;
        $scope.touchEndPosX = e.touches[0].pageX;
        $scope.imageListWrapper.classList.add('no-transition');
      });
      $scope.uiElement.addEventListener("touchmove", (e)=>{
        $scope.touchEndPosX = e.touches[0].pageX;
        let diff = ($scope.touchEndPosX - $scope.touchStartPosX) / 3;
        if (diff > 20 && $scope.currentIndex == 0) {

        }
        else if (diff < -20 && $scope.currentIndex == $scope.images.length - 1){

        }
        else {
          $scope.imageListWrapper.style.setProperty("--interactiveOffset", diff + "px");
        }
      });
      $scope.uiElement.addEventListener("touchend", (e)=>{
        $scope.imageListWrapper.classList.remove('no-transition');
        $scope.imageListWrapper.style.setProperty("--interactiveOffset", 0 + "px");
        if ($scope.touchEndPosX - 80 > $scope.touchStartPosX) {
          $scope.changeImage(-1);
          $scope.$apply();
        }
        else if ($scope.touchEndPosX + 80 < $scope.touchStartPosX) {
          $scope.changeImage(1);
          $scope.$apply();
        }
      });

      $scope.uiElement.addEventListener('click', function (e) {
        if (!e.target.closest('.right') && !e.target.closest('.left')) {
        $scope.openZoom();
        }
      });

      $scope.adaptOnLoad = function () {
        $scope.iteration++;
        $scope.tempLoader[$scope.iteration] = new Image();
        $scope.tempLoader[$scope.iteration].src = $scope.currentImage.img;
        return setTimeout(() => $scope.adaptOnLoadLoop()
          , 10);
      };
      $scope.adaptOnLoadLoop = function () {
        // if (($scope.img.naturalWidth !== 0) && (($scope.storeImgWidth !== $scope.img.naturalWidth) || ($scope.storeImgHeight !== $scope.img.naturalHeight))) {
        //   $scope.adaptImage();
        // } else if ($scope.img.naturalWidth !== 0) {
        //   setTimeout(() => $scope.seeImage = true
        //     , 300);
        // } else {
        //   setTimeout($scope.adaptOnLoadLoop, 20);
        // }
      };

      $scope.adaptImage = function () {
        $scope.storeImgWidth = $scope.img.naturalWidth;
        $scope.storeImgHeight = $scope.img.naturalHeight;
        $scope.seeImage = true;
        if (!$scope.$$phase && !$scope.$parent.$$phase) {
          $scope.$apply();
        }
        if ($scope.currentSrc !== $scope.img.getAttribute('src')) {
          $scope.currentSrc = $scope.img.getAttribute('src');
          const tempImg = new Image();
          tempImg.src = $scope.img.getAttribute('src');

          const {width} = tempImg;
          const {height} = tempImg;
          const containerW = $('.slider').width();
          const containerH = $('.slider').height();
          const ratio = width / height;
          if (ratio >= 1.78) {
            $('.displayed-img').attr('width', containerW);
            $('.displayed-img').attr('height', containerW / ratio);
          }

          if (ratio < 1.78) {
            $('.displayed-img').attr('height', containerH);
            return $('.displayed-img').attr('width', containerH * ratio);
          }
        }
      };

      $scope.updateCurrentImage = function () {
        $scope.currentImage = $scope.images[$scope.currentIndex];
        $scope.adaptOnLoad();
      };

      $scope.changeImage = function (index) {

        if ((index < 0) && ($scope.currentIndex > 0)) {
          $scope.currentIndex += index;
          $scope.updateCurrentImage();
        } else if ((index > 0) && ($scope.currentIndex < ($scope.images.length - 1))) {
          $scope.seeImage = false;
          $scope.currentIndex += index;
          $scope.updateCurrentImage();
        }
        $scope.imageListWrapper.style.setProperty('--currentIndex', $scope.currentIndex)
      };


      $scope.likePost = () => $scope.$parent.likePost();

      $scope.closeZoom = () => $('.zoom-container').remove();

      $scope.openZoom = function () {
        let globalPopup = document.getElementById("globalPopup");
        globalPopup.appendChild($scope.imageListWrapper);
        $scope.imageListWrapper.querySelectorAll('img').item($scope.currentIndex).scrollIntoView(true);
        globalPopup.addEventListener('click', $scope.closeZoom);
        globalPopup.classList.add('show');
      };

      $scope.closeZoom = () => {
        let globalPopup = document.getElementById("globalPopup");
        globalPopup.removeEventListener('click', $scope.closeZoom);
        $scope.imageList.appendChild($scope.imageListWrapper);
        globalPopup.classList.remove('show');
      };

      //  `7MMF'`7MN.   `7MF'`7MMF'MMP""MM""YMM 
      //    MM    MMN.    M    MM  P'   MM   `7 
      //    MM    M YMb   M    MM       MM      
      //    MM    M  `MN. M    MM       MM      
      //    MM    M   `MM.M    MM       MM      
      //    MM    M     YMM    MM       MM      
      //  .JMML..JML.    YM  .JMML.   .JMML.

      $scope.seeImage = true;
      $scope.currentImage = {};
      $scope.currentIndex = 0;
      $scope.$parent.info.isAppInit = true;
      $scope.post.splitContent = $scope.post.content.split('<p><nextimage></p>');
      $scope.images = [];
      for (let index = 0; index < $scope.post.images.length; index++) {
        const image = $scope.post.images[index];
        const imagePost = {
          img: image,
          title: $scope.post.titres[index],
          paragraph: $scope.post.descriptions[index]
        };
        $scope.images.push(imagePost);
      }
      $scope.updateCurrentImage();
    }
  })

]);