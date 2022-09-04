/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.controller('autourDeHens', ['localeFactory','$scope', '$rootScope',function(localeFactory, $scope, $rootScope){
  $scope.isMoving = false;
  $scope.$on('$destroy', function(){
    clearInterval($scope.menuInterval);
    TweenLite.killTweensOf($scope);
    $scope.vidFond.pause(); 
    $scope.vidFond.src = "";
    $scope.vidFond.load();
    return delete $scope.vidFond;
  });
  $scope.menuInterval = setInterval(function(){
    if ($scope.vidFond !== undefined) {
      $scope.currentVolume = Math.min(1,Math.max(0.25, 0.9 - (-$('#1').offset().top / 1600) ));
      if ($scope.audio) {
        $scope.vidFond.volume = $scope.currentVolume;
        hensApp.log($scope.currentVolume);
      }
    }
    if (($('#1').offset().top < 300) && !$scope.isMoving) {
      if ($('#2').offset().top < 300) {
        if ($('#3').offset().top < 300) {
          if ($('#4').offset().top < 300) {
            return $scope.changeActive($('.4-bt'),false);
          } else {
            return $scope.changeActive($('.3-bt'),false);
          }
        } else {
          return $scope.changeActive($('.2-bt'),false);
        }
      } else {
        return $scope.changeActive($('.1-bt'),false);
      }
    }
  }
  ,200);

  $('.bt-roll').click(function(e){
    const elt = this;
    $scope.isMoving = true;
    setTimeout(
      ()=> $scope.isMoving = false
    ,1000);
    return $scope.changeActive(elt,true);
  });


  $scope.changeActive=function(elt,isMove){
    $('.bt-roll').removeClass('active');
    $(elt).addClass('active');
    if (isMove) {
      const index = $(elt).attr('ha-value');
      $scope.offsetTop = parseInt($('.univers-hens-container').find('.mCSB_container').css('top').replace('px',''));
      const toGo = $(`#${index}`).offset().top - $scope.offsetTop;
      return TweenLite.to($scope,1, {
        offsetTop: - (toGo - 80),
        onUpdate(){
          $('.univers-hens-container').find('.mCSB_container').css('top',$scope.offsetTop);
          $scope.offsetTop = parseInt( $('.univers-hens-container').find('.mCSB_container').css('top').replace('px','') );
          const percent= ( -$scope.offsetTop / $('.univers-hens-container').find('.mCSB_container').height() ) * $('.main-center').height();
          return $('#mCSB_1_dragger_vertical').css('top',percent);
        }
      } 
      );
    }
  };

  localeFactory.JSON('univers').then(function(res){
    $scope.content = res.data;
    $scope.localContent =
      {universTitre: "L'univers de Hens"};
    $scope.$parent.info.isAppInit = true;
    $scope.teaserLink = myLocalized.medias+"univers/teaser.mp4";
    $scope.vidFond = document.getElementById('fond-vid');
    $scope.audio = true;
    $scope.waitPlay();
    $scope.currentVolume = 0.8;
    return $('#fond-vid').css('height',($('#fond-vid').parent()*9) / 16);
  });
  $scope.waitPlay=function(){
    if (($scope.vidFond.readyState === 4) && $scope.vidFond.paused) {
      $scope.vidFond.play();
      if ($rootScope.isPlaying === 'true') {
        return $scope.$emit('togglePlay');
      }
    } else {
      return setTimeout($scope.waitPlay, 200);
    }
  };
  return $scope.toggleAudio = function(root){
    let tl;
    if ($scope.audio) {
      tl = new TimelineLite();
      tl.to($scope.vidFond,1,
        {volume:0});
      if ($rootScope.isPlaying === 'true') {
        $scope.$emit('togglePlay');
      }
    } else if (!$scope.audio) {
      tl = new TimelineLite();
      tl.to($scope.vidFond,1,
        {volume:$scope.currentVolume});
    }
    return $scope.audio = !$scope.audio;
  };
}
]);