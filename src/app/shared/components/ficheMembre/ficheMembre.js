hensApp.directive('ficheMembre',['postFactory',postFactory=>
  ({
    restrict:'A',
    templateUrl: myLocalized.partials+ 'directives/ficheMembre.html',
    scope: {
      isMe:'=',
      showFiche:'=',
      user:'='
    },
    controller($scope,$element){
      $scope.postManager = postFactory;

      $scope.togglePreview=function(){
        $scope.showEditFiche = !$scope.showEditFiche;
        return $scope.showDisplayFiche = !$scope.showDisplayFiche;
      };
      $scope.validateChar=function(){
        let post;
        $scope.editProcess=true;
        if ($scope.persoPost === undefined) {
          post= {
            title: `Fiche de Personnage de ${$scope.user.username}`,
            content_raw: `${$scope.personnage.prenom}|:|${$scope.personnage.nom}|:|${$scope.personnage.suffixe}|:|${$scope.personnage.age}|:|${$scope.personnage.village}|:|${$scope.personnage.histoire}|:|${$scope.personnage.caractere}|:|${$scope.personnage.particularite}|:|${$scope.personnage.pouvoir}|:|`,
            name: `hensApp-${$scope.user.slug}-ficheperso`,
            type: "post",
            comment_status: "opened",
            status: "publish"
          };
          return $scope.postManager.newPost(post).then(function(res){
            $scope.editProcess = false;
            return $scope.close();
          });
        } else {
          post= {
            ID: $scope.persoPost.ID,
            title: `Fiche de Personnage de ${$scope.user.username}`,
            content_raw:`${$scope.personnage.prenom}|:|${$scope.personnage.nom}|:|${$scope.personnage.suffixe}|:|${$scope.personnage.age}|:|${$scope.personnage.village}|:|${$scope.personnage.histoire}|:|${$scope.personnage.caractere}|:|${$scope.personnage.particularite}|:|${$scope.personnage.pouvoir}|:|`,
            name: `hensapp-${$scope.user.slug}-ficheperso`,
            type: "post",
            comment_status:"opened",
            status:"publish"
          };
          return $scope.postManager.updatePost(post).then(function(res){
            $scope.editProcess = false;
            return $scope.close();
          });
        }
      };
      $scope.closePostit=()=> $('.post-it').css('opacity',0);

      $scope.close=()=> $scope.showFiche = false;

      $scope.getPerso=()=>
        $scope.postManager.getPostBySlug(`hensapp-${$scope.user.slug}-ficheperso`).then(function(res){
          $scope.display();
          if (res.length === 0) {
            return $scope.personnage = {
              prenom:'',
              nom:'',
              suffixe:'',
              age:'',
              village:'',
              histoire:'',
              caractere:'',
              particularite:'',
              pouvoir:''
            };
          } else {
            $scope.persoPost= res.data[0];
            $scope.persoPost.content = $scope.persoPost.content.replace('<p>','');
            $scope.persoPost.content = $scope.persoPost.content.replace('</p>','');
            $scope.persoPost.content = hensApp.replaceAll("&#8217;","'",$scope.persoPost.content);

            $scope.persoPost.splitContent = $scope.persoPost.content.split('|:|');
            $scope.personnage = {};
            $scope.personnage.prenom = $scope.persoPost.splitContent[0];
            $scope.personnage.nom = $scope.persoPost.splitContent[1];
            $scope.personnage.suffixe = $scope.persoPost.splitContent[2];
            $scope.personnage.age = $scope.persoPost.splitContent[3];
            $scope.personnage.village = $scope.persoPost.splitContent[4];
            $scope.personnage.histoire = $scope.persoPost.splitContent[5];
            $scope.personnage.caractere = $scope.persoPost.splitContent[6];
            $scope.personnage.particularite = $scope.persoPost.splitContent[7];
            return $scope.personnage.pouvoir = $scope.persoPost.splitContent[8];
          }})
      ;

      $scope.init=function(){
        $scope.villageSetup();
        return $scope.getPerso();
      };

      $scope.display=function(){
        if ($scope.isMe && $scope.showFiche) {
          $scope.showEditFiche = true;
          return $scope.showDisplayFiche = false;
        } else if (!$scope.isMe && $scope.showFiche) {
          $scope.showEditFiche = false;
          return $scope.showDisplayFiche = true;
        }
      };


      return $scope.$watch('showFiche',function(newValue,oldValue){
        if ($scope.showFiche === true) { return $scope.init(); }
      });
    }
  })

]);
