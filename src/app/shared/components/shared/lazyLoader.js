hensApp.directive('lazyLoader', [()=> {
  return {
    scope: {
      onScrollEnd: '=',
      disabled: '@'
    },
    link: ($scope, $element)=> {
      $scope.loading = false;
      $element.scroll(e=> {
        if(e.currentTarget.scrollTop > (e.currentTarget.scrollHeight - e.currentTarget.offsetHeight - 200)) {
          if ($scope.disabled !== 'true' && !$scope.loading) {
            $scope.loading = true;
            $scope.onScrollEnd((resultLength)=> {
              $scope.loading = false;
            })
          }
        }
      });
      return $scope.$on('lazy-load', (event, data)=> {
        if (data === 'reset') {
          return $element.scrollTop(0);
        }
      });
    }
  };
}
]);