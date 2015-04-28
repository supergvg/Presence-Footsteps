angular.module('starter').factory('eventsService', [ '$rootScope', '$http', '$q',
    function ($rootScope, $http, $q) {
        return  {

            createEvent: function (event) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/event",
                    data: event
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


            postGuestCheckin: function (checkinData, glInstance) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/GuestEventController/CheckinGuest",
                    data: {
                        guestId: checkinData.guest.id,
                        gliId: glInstance.id,
                        plus: checkinData.plus
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying check in guest, please try again');
                });

                return d.promise;
            },

            getGuestCheckin: function (guestId, gliId) {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/GuestEventController/GetGuestCheckin",
                    params: {
                        gliId: gliId,
                        guestId: guestId
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get guest information, please try again');
                });

                return d.promise;
            }
        }
    }]);
