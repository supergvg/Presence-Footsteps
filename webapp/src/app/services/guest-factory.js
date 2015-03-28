angular.module('gliist').factory("guestFactory", [
    "$resource", function ($resource) {
        "use strict";
        return {
            Guest: $resource('/api/guest/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    },
                    url: '/api/guest/:id'
                }
            }),

            GuestList: $resource('/api/guestlists/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'POST',
                    params: {
                        id: '@id'
                    },
                    url: '/api/guestlists/:id'
                }
            })
        };
    }
]);
