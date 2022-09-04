angular.module('app').controller('Calendrier', [
  '$rootScope', '$scope', 'calendrierFactory', function ($rootScope, $scope, calendrierFactory) {
    $scope.info.isAppInit = false;
    $scope.seasonVillage = {
      "automne": "sulimo",
      "hiver": "ulmo",
      "printemps": "wilwar",
      "ete": "anar"
    };
    $scope.months = hensApp.c.months;
    $scope.jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    $scope.setSelectedDate = function (date) {
      $scope.events = $scope.events.map(event => {
        event.mStart = moment(event.mStart).year(moment(date).year());
        event.mEnd = moment(event.mEnd).year(moment(date).year());
        return event;
      });
      $scope.selectedDate = $scope.getDayObject(date);
    };

    $scope.getDayObject = (date) => {
      let season;
      const d = date.getDate();
      const m = date.getMonth() + 1;
      if (hensApp.isDateBetween([d, m], [1, 1], [20, 3]) || ((m === 12) && (d >= 21))) {
        season = "hiver";
      } else if (hensApp.isDateBetween([d, m], [21, 3], [20, 6])) {
        season = 'printemps';
      } else if (hensApp.isDateBetween([d, m], [21, 6], [20, 9])) {
        season = 'ete';
      } else if (hensApp.isDateBetween([d, m], [21, 9], [20, 12])) {
        season = 'automne';
      }
      let dayObject = {
        date: date,
        dateMoment: moment(date),
        jour: $scope.jours[date.getDay()],
        mois: $scope.months[date.getMonth()],
        event: $scope.events ? $scope.events.find(event => {
          let dateM = moment(date).year(event.mStart.year());
          return (event.mStart.isBefore(dateM) && event.mEnd.isAfter(dateM)) ||
            event.mStart.isSame(dateM) || event.mEnd.isSame(dateM);
        }) : null,
        day: date.getDay(),
        monthDay: date.getDate(),
        month: date.getMonth(),
        season: season
      };
      if (dayObject.event) {
        dayObject.eventPosition =
          dayObject.event.mStart.isSame(dayObject.dateMoment) ? 'left' :
            dayObject.event.mEnd.isSame(dayObject.dateMoment) ? 'right' : 'middle';
      }
      return dayObject;
    };

    $scope.buildMonth = (dateObject) => {
      let md = dateObject.dateMoment;
      let firstMonthDay = moment(md).startOf('month');
      let weekDay = firstMonthDay.day();
      while (weekDay > 0) {
        firstMonthDay = firstMonthDay.subtract(1, 'days');
        console.log('subtract 1', $scope.jours[firstMonthDay.day()]);
        weekDay = firstMonthDay.day();
      }
      firstMonthDay.add(1, 'days'); // se placer sur lundi plutôt que dimanche.
      $scope.monthDays = [];
      var currentMd = moment(firstMonthDay);
      while (((currentMd.month() <= md.month() && currentMd.year() === md.year()) || currentMd.year() < md.year()) ||
      currentMd.day() !== 1) {
        $scope.monthDays.push($scope.getDayObject(moment(currentMd.toDate()).toDate()));
        currentMd = currentMd.add(1, 'days');
        console.log(currentMd.month(), md.month(), currentMd.year(), md.year());
      }
      console.log($scope.monthDays);
    };

    $scope.selectDate = (monthDay) => {
      let isNewMonth = (monthDay.month != $scope.selectedDate.month);
      $scope.setSelectedDate(monthDay.date);
      if (isNewMonth) {
        $scope.buildMonth(monthDay);
      }
    };

    $scope.selectPreviousMonth = () => {
      let newDateMoment = $scope.selectedDate.dateMoment.subtract(1, 'months');
      let isNewMonth = (newDateMoment.month() !== $scope.selectedDate.month);
      $scope.setSelectedDate(newDateMoment.toDate());
      if (isNewMonth) {
        $scope.buildMonth($scope.selectedDate);
      }
    };
    $scope.selectNextMonth = () => {
      let newDateMoment = $scope.selectedDate.dateMoment.add(1, 'months');
      let isNewMonth = (newDateMoment.month() !== $scope.selectedDate.month);
      $scope.setSelectedDate(newDateMoment.toDate());
      if (isNewMonth) {
        $scope.buildMonth($scope.selectedDate);
      }
    };

    $scope.info.isAppInit = true;
    calendrierFactory.getEvents().then((data) => {
      $scope.events = data.data.map(event => {
        event.mStart = moment(event.start_date).year(moment().year());
        event.mEnd = moment(event.end_date).year(moment().year());
        event.formatStartDate = event.mStart.date() + " " + $scope.months[event.mStart.month()];
        event.formatEndDate = event.mEnd.date() + " " + $scope.months[event.mEnd.month()];
        return event;
      });
      $scope.setSelectedDate(new Date());
      $scope.buildMonth($scope.selectedDate);
      $scope.info.isAppInit = true;
    }).catch($rootScope.handleError);
  }
]);