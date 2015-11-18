angular.module('gliist').factory('eventsService', ['$rootScope', '$http', '$q',
    function ($rootScope, $http, $q) {
        return {

            removeGuestsFromGL: function (guestListId, guestIds) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/GuestEventController/DeleteGuestsGuestList",
                    data: {
                        id: guestListId,
                        ids: guestIds
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error, please try again');
                });

                return d.promise;
            },

            removeGuestsFromGLInstance: function (guestListId, guestIds) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/GuestEventController/DeleteGuestsGuestListInstance",
                    data: {
                        id: guestListId,
                        ids: guestIds
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error, please try again');
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
                }).error(function (err) {
                    d.reject(err);
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
            },
            
            createEvent: function (event) {
                var d = $q.defer(),
                    server = angular.copy(event);

                //server.time = moment.tz(server.time, "Atlantic/Reykjavik").toString();
                //server.endTime = moment.tz(server.endTime, "Atlantic/Reykjavik").toString();
                event.userOffset = event.time.getTimezoneOffset() / 60;

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

            publishEvent: function (gli_ids, eventId) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/GuestEventController/PublishEvent",
                    data: {ids: gli_ids, eventId: eventId}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error publishing event, please try again');
                });

                return d.promise;
            },

            linkGuestList: function (guestLists, eventId, instanceType) {
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
                    data: {guestListIds: ids, eventId: eventId, instanceType: instanceType}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },


            importGuestList: function (masterGLId, guestLists, gl) {
                var d = $q.defer(),
                    ids = _.map(guestLists, function (gl) {
                        if (!gl) {
                            return;
                        }
                        return gl.id
                    });


                $http({
                    method: "POST",
                    url: "api/GuestEventController/ImportGuestList",
                    data: {ids: ids, id: masterGLId, gl: gl}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            deleteGuestList: function (gli, eventId) {
                var d = $q.defer(),
                    ids = [gli.id];

                $http({
                    method: "POST",
                    url: "api/GuestEventController/DeleteGuestList",
                    data: {ids: ids, eventId: eventId}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getPastEvents: function () {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/event/PastEvents/"
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getCurrentEvents: function () {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/event/CurrentEvents/"
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
            },
            
            getPublicEventDetails: function(type, companyName, eventName) {
                // type = rsvp or tickets
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/"+type+"/PublicDetails/"+companyName+'/'+eventName
                }).success(function(data) {
                    d.resolve(data);
                }).error(function(data) {
                    d.reject(data);
                });

                return d.promise;
            },
            
            getPersonalEventDetails: function(type, token) {
                // type = rsvp or tickets
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/"+type+"/InvitedDetails/"+token
                }).success(function(data) {
                    d.resolve(data);
                }).error(function(data) {
                    d.reject(data);
                });

                return d.promise;
            },
            
            confirmRSVPPublicEvent: function(data) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/rsvp/PublicConfirm",
                    data: data
                }).success(function (data) {
                    d.resolve(data);
                }).error(function(data) {
                    d.reject(data);
                });

                return d.promise;
            },
            
            confirmRSVPPersonalEvent: function(data) {
                var d = $q.defer();

                $http({
                    method: "POST",
                    url: "api/rsvp/InvitedConfirm",
                    data: data
                }).success(function (data) {
                    d.resolve(data);
                }).error(function(data) {
                    d.reject(data);
                });

                return d.promise;
            }
        };
    }]);
