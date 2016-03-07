'use strict';

angular.module('gliist').factory('dialogService', [ '$mdToast',

    function ($mdToast) {
        return  {
            error: function(err) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(err)
                        .position('center center')
                        .hideDelay(10000)
                );
            },

            success: function(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('center center')
                        .hideDelay(3000)
                );
            }
        };
    }
]);
