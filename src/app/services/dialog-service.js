'use strict';

angular.module('gliist').factory('dialogService', [ '$mdToast',

    function ($mdToast) {
        return  {
            error: function (err) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(err)
                        .position('right')
                        .hideDelay(10000)
                );
            },

            success: function (message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('right')
                        .hideDelay(3000)
                );
            }
        };
    }
]);
