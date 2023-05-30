function formatEventDate(momentDate) {
    return (momentDate.date() + 1) + " " + hensApp.c.months[momentDate.month()];
}

angular.module('app').component('nextEvent', {
    templateUrl: myLocalized.partials + 'nextEvent.html',
    controller: [
        '$scope', '$element', '$rootScope', 'eventsFactory', function ($scope, $element, $rootScope, eventsFactory) {
            this.$onInit = () => {
                this.hasCurrentEvent = false;
                eventsFactory.getShowcasedEvent().then((showcasedEvent) => {
                    this.event = showcasedEvent.event;
                    this.eventVillage = hensApp.getSeasonVillage(moment(showcasedEvent.startDate));
                    this.event.formatStartDate = formatEventDate(moment(this.event.start_date));
                    this.event.formatEndDate = formatEventDate(moment(this.event.end_date));
                    this.event.name = this.event.name.toUpperCase();
                });
            }
        }]
})