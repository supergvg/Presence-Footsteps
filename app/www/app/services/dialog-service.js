angular.module('starter').factory('dialogService', [ '$rootScope', '$http', '$q', '$ionicPopup',

    function ($rootScope, $http, $q, $ionicPopup) {
        return  {


            error: function (err) {
                $ionicPopup.alert({
                    title: 'Error',
                    template: err || 'Action failed, please try again'
                });
            },

            success: function (message) {
                console.log('dialog-service: ' + message);
            }
        }
    }
]);
