angular.module('starter').factory('eventsService', [ '$rootScope', '$http', '$q',
    function ($rootScope, $http, $q) {
        return  {


            getEvents: function () {
                var d = $q.defer();

                $http({
                    method: "GET",
                    url: "api/event",
                    headers: {
                        authorization: 'Bearer ' + window.localStorage['access_token']
                    },
                    params: {
                    }
                }).success(function (data) {
                    d.resolve(data);
                }).error(function () {
                    d.reject('Oops there was an error trying to get events, please try again');
                });

                return d.promise;
            },

            getGuests: function (eventId) {
                return [
                    {
                        id: '1',
                        name: 'John Doe',
                        photo: 'img/company-logo.png'
                    },
                    {
                        id: '2',
                        name: 'Paris Hilton',
                        photo: 'img/company-logo.png'
                    },
                    {
                        id: '1',
                        name: 'Kim Kardashian',
                        photo: 'img/company-logo.png'
                    },
                    {
                        id: '1',
                        name: 'John Doe',
                        photo: 'img/company-logo.png'
                    }

                ];
            }
        }
    }])
;
