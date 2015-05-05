angular.module('gliist').factory('eventsService', [ '$rootScope', '$http', '$q',
    function ($rootScope, $http, $q) {
        return  {

            getEventInvite: function (height, eventId, suffix) {
                var bgImg,
                    redirectUrl = "http://gliist.azurewebsites.net/";

                bgImg = redirectUrl + "/api/GuestEventController/InvitePicture/?eventId=" + eventId + "&suffix=" + suffix;
                bgImg = "url(" + bgImg + ")";

                return {
                    'background-image': bgImg,
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-size': 'cover'
                };

            },

            createEvent: function (event) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/event",
                    data: event,
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            addGuestToEvent: function (guest, eventId) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/GuestEventController/AddGuest",
                    data: {guest: guest, eventId: eventId}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            linkGuestList: function (guestLists, eventId) {
                var d = $q.defer(),
                    ids = _.map(guestLists, function (gl) {
                        if (!gl) {
                            return;
                        }
                        return gl.id
                    });


                $http({
                    method: "POST",
                    url: "api/GuestEventController/linkGuestList",
                    data: {ids: ids, eventId: eventId}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getEvents: function (id) {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/event/" + (id || '')
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            deleteEvent: function (id) {
                var d = $q.defer();

                $http({
                    method: "DELETE",
                    url: "api/event",
                    params: {
                        id: id
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getGuestInfo: function (eventId, guestId) {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/guest/",
                    params: {
                        eventId: eventId,
                        guestId: guestId
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            }
        }
    }]);
