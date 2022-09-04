/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.directive('snowEffect', [
  () => ({
    restrict: 'A',
    templateUrl: myLocalized.specPartials + "snowEffect.html",
    controller: [
      "$scope", "$element", function ($scope, $element) {
        const isWinter = function (m) {
          const month = m.month() + 1;
          const day = m.date();
          return ((month === 12) && (day >= 21)) || ((month < 3) || ((month === 3) && (day < 21)));
        };
        const getSeed = function (m) {
          const nb = (m.hour() + m.month() + m.year()) * 9;
          console.log(nb, nb %10 + 1);
          return ((nb) % 10) + 1;
        };
        const now = moment();
        const seed = getSeed(now);
        const isWin = isWinter(now);
        const isFireworks = now.month() === 0 && (now.date() <= 5);
        if ((seed > 4) && isWin && !isFireworks) {
          const resize = function () {
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
          };

          const Vector = function (x, y) {
            this.x = x;
            return this.y = y;
          };

          const Snowflake = function (size) {
            this.position = new Vector(0, 0);
            this.velocity = new Vector(0, 0);
            this.size = size;
            this.color = `rgba(255,255,255,${max_snowflake_radius - this.size})`;
          };
          const circle = Math.PI * 2;
          const snowflakes = [];
          const max_snowflakes = 180;
          const min_snowflake_radius = .5;
          var max_snowflake_radius = 4;
          const snowflake_max_velocity = 2.2;
          const gravity = new Vector(0, 0.03);
          const wind_speed = 0.025;
          const wind_max_speed = .05;
          const wind_entropy = 0.0125;
          const wind = new Vector((Math.random() - 0.49999) * wind_speed, 0);
          var render = function () {
            let i = undefined;
            const l = snowflakes.length;
            let flake = undefined;
            const min_x = canvas.width * -0.25;
            const max_x = canvas.width * 1.25;
            i = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            while (i < l) {
              flake = snowflakes[i];
              const half_size = flake.size * 0.5;
              flake.velocity.x =
                Math.max(-snowflake_max_velocity, Math.min(snowflake_max_velocity, flake.velocity.x + gravity.x +
                  wind.x + ((Math.random() - 0.5) * wind_entropy)));
              flake.velocity.y =
                Math.max(-snowflake_max_velocity, Math.min(snowflake_max_velocity, flake.velocity.y + gravity.y +
                  wind.y + ((Math.random() - 0.5) * wind_entropy)));
              flake.position.x += half_size * flake.velocity.x;
              flake.position.y += half_size * flake.velocity.y;
              if ((flake.position.y < window.innerHeight) && (flake.position.x > min_x) && (flake.position.x < max_x)) {
                if ((flake.position.x > 0) && (flake.position.x < canvas.width) && (flake.position.y > 0)) {
                  ctx.fillStyle = flake.color;
                  ctx.beginPath();
                  ctx.arc(flake.position.x, flake.position.y, flake.size, 0, circle);
                  ctx.closePath();
                  ctx.fill();
                }
              } else {
                flake.position.x = (Math.random() * canvas.width * 3) - (canvas.width);
                if ((flake.position.x < 0) || (flake.position.x > canvas.width)) {
                  flake.position.y = Math.random() * canvas.height;
                } else {
                  flake.position.y = Math.random() * -100;
                }
                flake.velocity = new Vector(0, 0);
              }
              i++;
            }
            wind.x += (Math.random() - 0.5) * wind_entropy * 0.125;
            wind.x = Math.max(-wind_max_speed, Math.min(wind_max_speed, wind.x));
            requestAnimationFrame(render);
          };

          const add_new_snowflake = function () {
            const w = canvas.width;
            const h = canvas.height;
            const size = (Math.random() * (max_snowflake_radius - min_snowflake_radius)) + min_snowflake_radius;
            const snowflake = new Snowflake(size);
            snowflake.position = new Vector((Math.random() * w * 3) - w, Math.random() * h);
            return snowflake;
          };

          const win = $(window);
          var canvas = document.getElementById('snow-effect');
          var ctx = canvas.getContext('2d');

          win.on('resize', resize).trigger('resize');
          let n = 0;
          while (n < max_snowflakes) {
            const snowflake = add_new_snowflake();
            snowflakes.push(snowflake);
            n++;
          }
          requestAnimationFrame(render);
        }
      }
    ]
  })

]);
