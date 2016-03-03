'use strict';

angular.module('gliist')
    .controller('EventCheckinCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$timeout', '$filter',
        function ($scope, $stateParams, dialogService, $state, eventsService, $timeout, $filter) {
            
            $scope.getExportExcelUrl = function() {
                return window.redirectUrl+'api/Event/GuestsListsExcelFile/'+$scope.event.id+'?authToken='+window.localStorage['access_token'];
            };
            
            $scope.checkinGuest = function (checkin) {
                $state.go('main.check_guest', {
                    guestId: checkin.guest.id,
                    gliId: checkin.gl_id
                });
            };

            $scope.glOptions = {
                readOnly: true
            };

            $scope.gridOptions = {
                rowTemplate: '<div><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div></div>',
                columnDefs: [
                    {field: 'guest.firstName', name: 'First Name', enableHiding: false},
                    {field: 'guest.lastName', name: 'Last Name', enableHiding: false},
                    {field: 'guest.title', name: 'List Title', enableHiding: false},
                    {field: 'guest.type', name: 'Type', enableSorting: true, enableHiding: false, width: 80},
                    {field: 'guest.email', name: 'Email', enableSorting: false, enableHiding: false},
                    {field: 'guest.plus', name: 'Plus', enableSorting: false, enableHiding: false, width: 80},
                    {
                        name: 'Check in', field: 'guest.id', enableSorting: false, enableHiding: false, width: 90,
                        cellTemplate: '<div class="actions" title="Checkin">' +
                            '<md-button class="icon-btn" md-no-ink="\'true\'" ng-click="grid.appScope.checkinGuest(row.entity)">' +
                            '<md-icon ng-show="row.entity.status == \'checked in\'" md-svg-src="assets/images/SVG/checkWhite.svg"></md-icon>' +
                            '<md-icon ng-show="grid.appScope.guestPending(row.entity)" md-svg-src="assets/images/SVG/checklist.svg"></md-icon>' +
                            '</md-button>' +
                            '</div>'
                    }

                ],
                rowHeight: 45,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false,
                data: []
            };

            $scope.$watchCollection('guestFilter', function (newValue) {

                    if (!newValue) {
                        return;
                    }

                    $scope.initGridData(newValue, $scope.event);
                }
            );


            $scope.guestPending = function (checkin) {
                return (checkin.status === 'no show');
            };

            $scope.initGridData = function (filter, data) {
                if (!data) {
                    return;
                }

                $scope.gridOptions.data = [];

                angular.forEach(data.guestLists, function (gl) {
                    angular.forEach(gl.actual, function (checkin) {

                            if (!checkin.guest.type) {
                                checkin.guest.type = gl.listType;
                            }
                            if (!checkin.guest.title) {
                                checkin.guest.title = gl.title;
                            }

                            var passedNameFilter = true;
                            if (filter.name) {
                                if (checkin.guest.firstName.toLowerCase().indexOf(filter.name.toLowerCase()) === -1 &&
                                    checkin.guest.lastName.toLowerCase().indexOf(filter.name.toLowerCase()) === -1) {
                                    passedNameFilter = false;
                                }
                            }
                            if (passedNameFilter) {
                                var guestPending = $scope.guestPending(checkin);

                                if (filter.status === 'checked' && !guestPending) {
                                    $scope.gridOptions.data.push(checkin);
                                }

                                if (filter.status === 'pending' && guestPending) {
                                    $scope.gridOptions.data.push(checkin);

                                }
                            }
                        }
                    );
                });
            };

            $scope.pastEvent = function() {
                var endTime = $filter('ignoreTimeZone')($scope.event.endTime);
                if (Date.now() > endTime.getTime()) {
                    return true;
                }
                return false;
            };

            $scope.event = {id: 0};

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.guestFilter = {status: 'pending'};

                $scope.initializing = true;

                $timeout(function () {
                    $(window).resize();
                }, 1000);

                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;


                    if ($scope.pastEvent()) {
                        $scope.gridOptions.columnDefs.pop();
                    }


                    $scope.initGridData($scope.guestFilter, data);

                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                );

            };

            $scope.init();

        }
    ]);
