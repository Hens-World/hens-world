hensApp.controller('Main',['$scope','$http','$routeParams', 'postFactory',function($scope ,$http, $routeParams, postFactory){
  const displayPosts = function(data, status){
    $scope.posts = data.data;
    return hensApp.log(data.data);
  };
  return postFactory.getPost().then(displayPosts);
}


]); 
