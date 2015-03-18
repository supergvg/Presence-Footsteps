///Cached service that keep the current cached state of the application
angular.module('agora.services')
    .service('appStateService', function () {
        "use strict";
        var searchParams = {};
        var loggedUser;
        return {

            setUser:function(user){
                loggedUser = user;
            },

            getUser: function () {
                return loggedUser;
            },

            getSearchParams: function () {
                return searchParams;
            },

            setSearchParams: function (value) {
                searchParams = value;
            }
        };
    });