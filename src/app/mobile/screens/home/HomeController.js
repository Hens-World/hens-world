hensApp.controller('Home', [
  '$scope', '$http', '$location', '$routeParams', 'userFactory', '$compile', '$rootScope',
  function ($scope, $http, $location, $routeParams, userFactory, $compile, $rootScope) {
    $scope.$parent.info.isAppInit = false;
    $rootScope.$emit('bottomNav:select', "Connexion");

    $scope.circle = document.querySelector('.circles');

    let width = 320;
    let durations = [24, 21, 30];
    let strokeWidths = [4, 8, 7];
    let colors = ["rgb(219, 47, 0)", "rgb(1, 197, 195)", "rgb(229, 140, 0)", "rgb(159, 178, 0)"];
    for (let i = 0; i < 3; i++) {
      let duration = durations [i];
      let angle = 0;
      let radius = (width / 2) -  6 - i * 14;
      let perimeter = radius * Math.PI * 2;
      while (angle < 360) {
        let color = colors[Math.floor(Math.random() * colors.length)];
        let strokeWidth = 10 + Math.round(Math.random() * 50);
        if (strokeWidth + angle > 360) {
          strokeWidth = 360 - angle;
        }
        if (strokeWidth > 0) {
          let percentStart = angle / 360;
          let frag = document.createDocumentFragment();
          let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.style.animationDelay = `${-i * 2}s`;
          circle.style.animationDuration = duration + "s";
          circle.setAttribute('cx', (width / 2).toString());
          circle.setAttribute('cy', (width / 2).toString());
          circle.setAttribute('r', (radius).toString());
          circle.setAttribute('stroke', color);
          let separator = 2 + Math.random() * 4;
          circle.setAttribute('stroke-dasharray', `${perimeter * (strokeWidth  - separator) / 360} ${perimeter * (360 - strokeWidth + separator) / 360}`);
          circle.setAttribute('stroke-dashoffset', `${-percentStart * perimeter}`);

          circle.setAttribute('fill', 'transparent');

          circle.setAttribute('stroke-width', strokeWidths[i].toString());
          $scope.circle.appendChild(circle);
          angle += strokeWidth;
        }
      }
    }
    $scope.$parent.info.isAppInit = true;

  }
]);