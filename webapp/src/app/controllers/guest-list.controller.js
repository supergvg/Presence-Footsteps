'use strict';

angular.module('gliist')
    .controller('GuestListCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http',
        function ($scope, guestFactory, dialogService, $mdDialog, $http) {

            $scope.guests = [];

            $scope.addMore = function () {
                $scope.list.guests.push({
                });
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };


            $scope.deleteGlist = function (ev, glist) {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    //.parent(angular.element(document.body))
                    .title('Are you sure you want to delete guest list?')
                    //.content('Confirm ')
                    .ariaLabel('Lucky day')
                    .ok('Yes')
                    .cancel('No')
                    .targetEvent(ev);
                $mdDialog.show(confirm).then(function () {
                    guestFactory.GuestList.delete({id: glist.id}).then(function () {
                        $scope.getGuestLists();
                    }, function () {
                        dialogService.error('There was a problem please try again');
                    })


                }, function () {
                    $scope.alert = 'You decided to keep your debt.';
                });
            };

            $scope.showGlistDialog = function (ev, event) {

                var scope = $scope.$new();
                scope.currentGlist = event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/templates/list/glist-dialog.tmpl.html',
                    targetEvent: ev
                });
            };


            $scope.getGuestLists = function () {
                $scope.fetchingData = true
                guestFactory.GuestLists.get().$promise.then(
                    function (data) {
                        $scope.guestLists = data;
                    }, function () {
                        dialogService.error('There was a problem getting lists, please try again');
                    }).finally(function () {
                        $scope.fetchingData = false;
                    })
            };

            $scope.save = function () {
                guestFactory.GuestList.update($scope.list).$promise.then(
                    function (res) {
                        $scope.list = res;
                        dialogService.success('Event created: ' + JSON.stringify(res));

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    })
            };

            $scope.init = function () {

                if (!$scope.list) {
                    $scope.list = {
                        title: 'bla lba',
                        guests: [
                            {
                                firstName: 'eran',
                                lastName: 'kaufman',
                                email: 'erank3@yahoo.com'}
                        ]
                    }
                }

            };

            $scope.init();

        }]);
