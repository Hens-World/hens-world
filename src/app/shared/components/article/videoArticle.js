/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('videoArticle', ['userFactory', '$compile',(userFactory,$compile)=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials + 'videoArticle.html',
    scope: {
      user:'=',
      post:'=',
      isFav:'='
    },
    controller($scope,$element){

      let meta;
      $scope.$on('$destroy', function(){
        clearInterval($scope.startVideoTime);
        clearInterval($scope.startVideoVolume);
        $scope.vidArt.volume = 0;
        $scope.vidArt.pause();
        $scope.vidArt.src = "";
        $scope.vidArt.load();
        return delete $scope.vidArt;
      });
      const html = "<div class='cinema-overlay'> </div>";
      $('.article-global-container').prepend(html);
    
      $scope.likePost=()=> $scope.$parent.likePost();

      $scope.smoothVolume=function(direction){
        if (direction === "up") {
          if ($scope.vidArt.volume < ($scope.toVolume - 0.041)) {
            $scope.smoothing = true;
            $scope.vidArt.volume += 0.04;
            //override volume
            const maxWidth = $('.controls-video').find('.volume-bar').width();
            const currentVol = $scope.storeVolume;
            const percent = currentVol * maxWidth;
            $('.controls-video').find('.volume-fill').css('width', percent - 2);
            $('.controls-video').find('.volume-hand').css('margin-left', percent - 3);

            setTimeout(
              ()=> $scope.smoothVolume(direction)
            ,1000/60);
          } else { 
            $scope.smoothing = false;
          }
        }

        if (direction === "down") {
          if ($scope.vidArt.volume > ($scope.toVolume + 0.041)) {
            $scope.smoothing = true;
            $scope.vidArt.volume -= 0.04;
            setTimeout(
              ()=> $scope.smoothVolume(direction)
            ,1000/60);
          } else {
            $scope.smoothing = false;
          }
        }

        if ((direction === "down") && ($scope.vidArt.volume <0.041)) {
          return $scope.vidArt.pause();
        }
      };
    
      $scope.togglePlay=function(){
        if (!$scope.smoothing) {
          if ($scope.videoPlaying) {
            $scope.isPlaying = "pause";
            $scope.storeVolume = $scope.vidArt.volume;
            $scope.toVolume = 0;
            $scope.smoothVolume('down');
            // $scope.vidArt.pause()
            $('.cinema-overlay').css('opacity',0);
            $('.cinema-overlay').css('z-index',-1);
          } else { 
            $scope.vidArt.volume = 0;
            $scope.toVolume = Math.min(0.99,$scope.storeVolume + 0.061);
            $scope.smoothVolume('up');
            $scope.isPlaying = "play";
            $('.cinema-overlay').css('opacity',1);
            $('.cinema-overlay').css('z-index',15);
            $scope.vidArt.play();  
          }
          return $scope.videoPlaying = !$scope.videoPlaying;
        }
      };

      $scope.updateVideoTime = function(){
        const maxWidth = $('.bar-container').width();
        const time = $scope.vidArt.currentTime;
        const { duration } = $scope.vidArt;
        const percent = (maxWidth * time) / duration;
        $('.controls-video').find('.bar-fill').css('width',`${percent - 2}px`);
        $('.controls-video').find('.bar-hand').css('margin-left',`${percent - 5}px`);
        $scope.vidArt.minutes = Math.floor(time / 60);
        $scope.vidArt.seconds = Math.floor(time % 60);
        if ($scope.vidArt.seconds < 10) {
          $scope.vidArt.seconds = `0${$scope.vidArt.seconds}`;
        }
        return $scope.$apply();
      };
    
      $scope.updateVolume =function(){
        let currentVol, maxWidth, percent;
        if (!$scope.smoothing) {
          maxWidth = $('.controls-video').find('.volume-bar').width();
          currentVol = $scope.vidArt.volume;
          percent = currentVol * maxWidth;
          $('.controls-video').find('.volume-fill').css('width', percent - 2);
          $('.controls-video').find('.volume-hand').css('margin-left', percent - 3);
        }
        if (!$scope.videoPlaying) {
          maxWidth = $('.controls-video').find('.volume-bar').width();
          currentVol = $scope.storeVolume;
          percent = currentVol * maxWidth;
          $('.controls-video').find('.volume-fill').css('width', percent - 2);
          return $('.controls-video').find('.volume-hand').css('margin-left', percent - 3);
        }
      };

      $scope.muteToggle=function(){
        if ($scope.isMuted) {
          $scope.vidArt.volume = $scope.storeVolumeMute;
        } else {
          $scope.storeVolumeMute = $scope.vidArt.volume;
          $scope.vidArt.volume = 0;
        }
      
        return $scope.isMuted = !$scope.isMuted;
      };

      $scope.toggleFS=function(){
        $scope.vidArt.volume = $scope.storeVolume;
        if (!$scope.fullScreen) {
          $scope.fullScreen = true;
        } else {
          $scope.fullScreen = false;
        }
        if ($scope.vidArt.requestFullScreen) {
          return $scope.vidArt.requestFullScreen();
        } else if ($scope.vidArt.webkitRequestFullScreen) {
          return $scope.vidArt.webkitRequestFullScreen();
        } else if ($scope.vidArt.mozRequestFullScreen) {
          return $scope.vidArt.mozRequestFullScreen();
        }
      };


      //                                                        ,,    ,,          
      //     `7MMF'        `7MMF'  `7MMF'                         `7MM  `7MM          
      //       MM            MM      MM                             MM    MM          
      //       MM  ,dW"Yvd   MM      MM   ,6"Yb.  `7MMpMMMb.   ,M""bMM    MM  .gP"Ya  
      //       MM ,W'   MM   MMmmmmmmMM  8)   MM    MM    MM ,AP    MM    MM ,M'   Yb 
      //       MM 8M    MM   MM      MM   ,pm9MM    MM    MM 8MI    MM    MM 8M"""""" 
      //  (O)  MM YA.   MM   MM      MM  8M   MM    MM    MM `Mb    MM    MM YM.    , 
      //   Ymmm9   `MbmdMM .JMML.  .JMML.`Moo9^Yo..JMML  JMML.`Wbmd"MML..JMML.`Mbmmd' 
      //                MM                                                            
      //              .JMML.                                                          

      $('.controls-video').find('.bar-container').mousedown(function(e){
        $scope.isMove = true;
        $scope.vidArt.pause();
        $scope.vidArt.pause();
        const maxWidth = $element.find('.bar-container').width();
        const { duration } = $scope.vidArt;
        const mouseX = e.pageX;
        const startX = $element.find('.bar-container').offset().left;
        const relDistance = Math.max(0,mouseX - startX);
        const percent = relDistance  / maxWidth;
        const currentTime = percent * duration;
        return $scope.vidArt.currentTime =  currentTime;
      });

      $('.controls-video').find('.volume-bar').mousedown(function(e){
        $scope.isVolMove = true;
        const maxWidth = $element.find('.volume-bar').width();
        const mouseX = e.pageX;
        const startX = $element.find('.volume-bar').offset().left;
        const relDistance = Math.min(maxWidth,Math.max(0,mouseX - startX));
        const percent = relDistance  / maxWidth;
        $scope.vidArt.volume =  percent;
        return $scope.storeVolume = $scope.vidArt.volume;
      });


      $(document).mouseup(function(){
        $scope.isMove = false;
        $scope.isVolMove = false;
        if ($scope.isPlaying === "play") {
          return $scope.vidArt.play();
        }
      });

      $element.find('.video-container').mousemove(function(e){
        let maxWidth, mouseX, percent, relDistance, startX;
        if ($scope.isMove) { 
          $scope.vidArt.pause();
          maxWidth = $element.find('.bar-container').width();
          const { duration } = $scope.vidArt;
          mouseX = e.pageX;
          startX = $element.find('.bar-container').offset().left;
          relDistance = Math.max(0,mouseX - startX);
          percent = relDistance  / maxWidth;
          const currentTime = percent * duration;
          return $scope.vidArt.currentTime =  currentTime;
        } else if ($scope.isVolMove) {
          maxWidth = $element.find('.volume-bar').width();
          mouseX = e.pageX;
          startX = $element.find('.volume-bar').offset().left;
          relDistance = Math.min(maxWidth,Math.max(0,mouseX - startX));
          percent = relDistance  / maxWidth;
          $scope.vidArt.volume =  percent;
          return $scope.storeVolume = $scope.vidArt.volume;
        }
      });

      //  `7MMF'`7MN.   `7MF'`7MMF'MMP""MM""YMM 
      //    MM    MMN.    M    MM  P'   MM   `7 
      //    MM    M YMb   M    MM       MM      
      //    MM    M  `MN. M    MM       MM      
      //    MM    M   `MM.M    MM       MM      
      //    MM    M     YMM    MM       MM      
      //  .JMML..JML.    YM  .JMML.   .JMML. 
      $scope.isMove = false;
      $scope.isVolMove = false;
      $scope.toVolume = 1;
      $scope.storeVolume = 1;
      $scope.storeVolumeMute = 1;
      $scope.videoPlaying = false;
      $scope.isMuted = false;
      $scope.userManager = userFactory;
      const br = "<br />";
      for (let key in $scope.post.custom_meta) {
        meta = $scope.post.custom_meta[key];
        if ((meta.length === 1) && (meta[0][0] === "[") && (meta[0][meta[0].length - 1] === "]")) {
          $scope.post.custom_meta[key] = JSON.parse(meta[0]);
        }
      }

      let post = $scope.post.content;
      $scope.vidArt = document.getElementById('above-video');
    
    

      //init whenever a video is loaded
      $scope.$watch('vidArt.videoHeight', function(newValue,oldValue){
        if ($scope.vidArt.videoHeight !== 0) { 
          $scope.vidWidth = $scope.vidArt.videoWidth;
          $scope.vidHeight = $scope.vidArt.videoHeight;
          $scope.ratioVid = $scope.vidWidth / $scope.vidHeight;
          const containerW = document.querySelector('.video-container').offsetWidth;
          const containerH = document.querySelector('.video-container').offsetHeight;
          const targetWidth =  0;
          const targetHeight = 0;
          if ($scope.ratioVid >= 1.776) {
            $('#above-video').attr('width',containerW); 
            $('#above-video').attr('height',containerW / $scope.ratioVid);
          }

          if ($scope.ratioVid < 1.776) {
            $('#above-video').attr('height',containerH); 
            $('#above-video').attr('width',containerH / $scope.ratioVid); 
          }

          if ($scope.startVideoTime === undefined) {
            $scope.startVideoTime = setInterval($scope.updateVideoTime,100);
          }
          if ($scope.startVideoVolume === undefined) {  
            $scope.startVideoVolume = setInterval($scope.updateVolume,100);
          }
        }


        return setTimeout(
          ()=> $scope.$parent.info.isAppInit = true
        ,100);
      });
    }
  })

]);