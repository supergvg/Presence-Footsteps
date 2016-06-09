'use strict';

angular.module('gliist').factory('guestFactory', [
    '$resource', function ($resource) {
        return {
            Guest: $resource('api/guest/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'PUT',
                    params: {
                        id: '@id'
                    },
                    url: 'api/guest/:id'
                }
            }),

            GuestLists: $resource('api/guestlists', {
            }, {
                'get': {
                    method: 'GET',
                    isArray: true
                }
            }),

            GuestList: $resource('api/guestlists/:id', {
                id: '@id'
            }, {
                update: {
                    method: 'POST',
                    params: {
                    },
                    url: 'api/guestlists'
                },
                delete: {
                    method: 'DELETE',
                    params: {
                    },
                    url: 'api/guestlists/:id'
                }
            }),

            GuestListInstance: $resource('api/GuestListInstances/:id/:promoter_Id', {
                id: '@id',
                promoter_Id: '@promoter_Id'
            }, {
                update: {
                    method: 'POST',
                    params: {
                    },
                    url: 'api/GuestListInstances'
                },
                delete: {
                    method: 'DELETE',
                    params: {
                    },
                    url: 'api/GuestListInstances/:id'
                }
            })
        };
    }
]);
