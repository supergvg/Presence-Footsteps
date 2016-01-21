'use strict';

angular.module('gliist')
    .controller('EventsListCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$rootScope',
        function ($scope, $mdDialog, eventsService, dialogService, $rootScope) {

            $scope.isPromoter = function () {
                return $rootScope.isPromoter();
            };

            $scope.isStaff = function () {
                return $rootScope.isStaff();
            };

            $scope.getEventInvite = function (event) {
                return {
                    'background-image': 'url(' + event.invitePicture + ')',
                    'background-position': 'center center',
                    'height': '120px',
                    'background-size': 'cover'
                };
            };

            $scope.formatedLocation = function(location) {
                var parsed = location.split(', '),
                    country = parsed.splice(parsed.length - 1, 1);
                return parsed.length > 0 ? parsed.join(', ') +'<br>'+ country : location;
            };

            $scope.deleteEvent = function (ev, event) {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                        //.parent(angular.element(document.body))
                        .title('Are you sure you want to delete event?')
                        //.content('Confirm ')
                        .ariaLabel('Lucky day')
                        .ok('Yes')
                        .cancel('No')
                        .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {
                    eventsService.deleteEvent(event.id).then(function () {
                        $scope.refreshEvents();
                    }, function () {
                        dialogService.error('There was a problem please try again');
                    });
                }, function () {
                    $scope.alert = 'You decided to keep your debt.';
                });
            };


            $scope.refreshEvents = function () {

                if ($scope.options && $scope.options.local) {
                    return;
                }

                $scope.fetchingData = true;

                var promise;
                if ($scope.options && $scope.options.past) {
                    promise = eventsService.getPastEvents();
                } else {
                    promise = eventsService.getCurrentEvents();
                }

                promise.then(function (data) {
                    $scope.events = data;
                }, function () {
                    //dialogService.error('There was a problem getting your events, please try again');
                }).finally(
                        function () {
                            $scope.fetchingData = false;
                        }
                );
            };

            $scope.init = function () {
                $scope.refreshEvents();
            };

            $scope.init();
        }]);
