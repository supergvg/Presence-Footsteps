angular.module('gliist').factory('dialogService',
    ['$rootScope', '$http', '$q',
        function ($rootScope, $http, $q) {
            return  {

                error: function (err) {
                    console.log('dialog-service: ' + err);
                }
            }
        }
    ]);
