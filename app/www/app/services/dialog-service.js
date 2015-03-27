angular.module('starter').factory('dialogService', [ '$rootScope', '$http', '$q',

    function ($rootScope, $http, $q) {
        return  {


            error: function (err) {
                console.log('dialog-service: ' + err);
            },

            success: function (message) {
                alert('dialog-service: ' + message);
            }
        }
    }
]);
