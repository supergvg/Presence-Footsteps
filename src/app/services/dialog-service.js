'use strict';

angular.module('gliist').factory('dialogService', [ '$mdToast', '$mdDialog', '$state',
    function ($mdToast, $mdDialog, $state) {
        return  {
            error: function(err) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(err)
                        .position('center center')
                        .hideDelay(3000)
                );
            },

            success: function(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('center center')
                        .hideDelay(3000)
                );
            },
            
            upgrade: function(event, message) {
                var confirm = $mdDialog.confirm({
                    title: message || 'This is a paid feature. Would you like to upgrade your plan to unlock this feature?',
                    ok: 'Upgrade',
                    cancel: 'Close',
                    targetEvent: event
                });
                $mdDialog.show(confirm).then(function() {
                    $state.go('main.user', {view: 2});
                });
            }
        };
    }
]);
