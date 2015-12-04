angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', 'uploaderService', '$state', '$timeout', '$rootScope', '$stateParams', '$location',
        function ($scope, $mdDialog, eventsService, dialogService, uploaderService, $state, $timeout, $rootScope, $stateParams, $location) {
            'use strict';


            $scope.isStaff = function () {
                return $rootScope.isStaff();
            };

            $scope.isPromoter = function () {
                return $rootScope.isPromoter();
            };

            $scope.eventCategories = [
                'Art',
                'Fashion',
                'Music',
                'Charity',
                'Technology',
                'Gaming',
                'Sports',
                'Food and wine',
                'Films',
                'Others'
            ];

            $scope.data = {
                selectedIndex: $location.search().view || 0,
                bottom: 'bottom'
            };

            $scope.$watchCollection('data.selectedIndex', function (newVal) {
                //$stateParams.view = newVal;
                $location.search('view', newVal);
            });

            $scope.glmOptions = {
                hideManualImport: true
            };

            $scope.getSelected = function (idx) {
                if ($scope.data.selectedIndex == idx) {
                    return 'logo-bg';
                }

            };

            $scope.getEventInvite = function (height) {
                return {
                    'background-image': "url(" + $scope.event.invitePicture + ")",
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-repeat': 'no-repeat',
                    'background-size': 'contain'
                };
            };


            $scope.onInviteSelected = function (files) {
                if (!files || files.length === 0) {
                    return;
                }
                $scope.upload(files[0]);
            };


            $scope.upload = function (files) {
                $scope.fetchingData = true;
                uploaderService.uploadEventInvite(files, $scope.event.id).then(function (res) {
                        $scope.event.invitePicture = res;
                        dialogService.success('Invite saved');

                    },
                    function (err) {
                        dialogService.error("There was a problem saving your image please try again");
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                )
            };


            $scope.onAddGLClicked = function (ev, instanceType) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;

                scope.selected = angular.copy($scope.event.guestLists);

                scope.options = {
                    enableSelection: true,
                    readOnly: true
                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };

                scope.importGLists = function () {
                    eventsService.linkGuestList(scope.selected, $scope.event.id, instanceType).then(
                        function (guestListInstances) {
                            $scope.event.guestLists = guestListInstances;
                            dialogService.success('Guest lists were linked');
                            $mdDialog.hide();
                        }, function () {
                            dialogService.error('There was a problem linking, please try again');
                        }
                    );
                };

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
                    targetEvent: ev
                });
            };


            $scope.onCreateNewGuestList = function (ev) {

                var scope = $scope.$new();

                scope.currentGlist = {
                    title: 'New Guest List',
                    guests: []

                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };

                scope.save = function () {
                    $scope.event.guestLists.push(scope.currentGlist);
                };

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-edit-dialog.tmpl.html',
                    targetEvent: ev
                });

            };

            $scope.displayDateErrorMessage = function (dateField) {

            };

            $scope.displayErrorMessage = function(field) {
                return false;
                //return ($scope.showValidation) || (field.$touched && field.$error.required);
            };


            $scope.timeValid = function () {

                var now = Date.now(),
                    d_now = new Date(now);
                if ($scope.event.utcOffset) {
                    now = now + (d_now.getTimezoneOffset() * 60000) + ($scope.event.utcOffset * 1000);
                }
               
                if ($scope.event.time < now) {
                    $scope.timeInvalid = true;
                    return false;
                }

                $scope.timeInvalid = false;

                if ($scope.event.time && $scope.event.endTime) {
                    if ($scope.event.time > $scope.event.endTime) {
                        $scope.endTimeInvalid = true;
                        return false;
                    }
                }
                $scope.timeInvalid = false;
                $scope.endTimeInvalid = false;

                return true;
            };

            $scope.dateOptions = {
                startingDay: 1,
                showWeeks: false
            };
            $scope.hourStep = 1;
            $scope.minuteStep = 15;
            $scope.showMeridian = true;

            $scope.timeOptions = {
                hourStep: [1, 2, 3],
                minuteStep: [1, 5, 10, 15, 25, 30]
            };

            $scope.next = function (form) {
                if ($scope.data.selectedIndex == 0 || $scope.data.selectedIndex == 2 || $scope.data.selectedIndex == 3) {
                    if ($scope.event.rsvpEndDate < $scope.event.time) {
                        $scope.event.rsvpEndDate = $scope.event.time
                    }
                    if (form && form.$invalid | !$scope.timeValid()) {
                        var errors = {
                            required: {
                                title: 'Please Enter Event Title',
                                category: 'Please Select Event Category',
                                location: 'Please Enter Event Location',
                                capacity: 'Please Enter Total Capacity'
                            },
                            pattern: {
                                title: 'Event Title can only contain alphabets, digits and spaces'
                            }
                        },
                        errorMessage = [];
                        angular.forEach(form.$error, function(value, key){
                            if (errors[key]) {
                                angular.forEach(value, function(value1, key1){
                                    if (errors[key][value1.$name])
                                        errorMessage.push(errors[key][value1.$name]);
                                });
                            }
                        });
                        if ($scope.timeInvalid) {
                            errorMessage.push("Cant Create Event in the Past");
                        }
                        if ($scope.endTimeInvalid) {
                            errorMessage.push("End time has to be after start time");
                        }
                        dialogService.error(errorMessage.join(', '));
                        $scope.showValidation = true;
                        return;
                    }
                    $scope.savingEvent = true;
                    eventsService.createEvent($scope.event).then(
                        function (res) {
                            $scope.event.id = res.id;
                            $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 4);
                            $scope.event.invitePicture = res.invitePicture;
                            $scope.event.rsvpUrl = res.rsvpUrl;
                            $scope.event.ticketingUrl = res.ticketingUrl;
                            $scope.event.facebookPageUrl = res.facebookPageUrl;
                            $scope.event.instagrammPageUrl = res.instagrammPageUrl;
                            $scope.event.twitterPageUrl = res.twitterPageUrl;
                            dialogService.success('Event ' + res.title + ' saved');

                        }, function () {
                            dialogService.error('There was a problem saving your event, please try again');
                        }
                    ).finally(
                        function () {
                            $scope.savingEvent = false;
                        }
                    );

                    return;
                }

                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 4);
            };
            $scope.previous = function () {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
            };

            $scope.onFinishClicked = function () {

                $scope.savingEvent = true;
                eventsService.createEvent($scope.event).then(
                    function (res) {
                        $scope.event.id = res.id;
                        dialogService.success('Event ' + res.title + ' saved');

                        $state.go('main.event_summary', {eventId: $scope.event.id});

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }
                ).finally(
                    function () {
                        $scope.savingEvent = false;
                    }
                )
            };

            $scope.createEvent = function () {
                $scope.savingEvent = true;
                eventsService.createEvent($scope.event).then(
                    function (res) {
                        $scope.event.id = res.id;
                        dialogService.success('Event ' + res.title + 'saved');

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }
                ).finally(
                    function () {
                        $scope.savingEvent = false;
                    }
                )
            };

            $scope.previewOptions = {hideEdit: true};

            $scope.location = {};

            $scope.minDate = Date.now();

            $scope.endMinDate = function () {
                return $scope.event.time || $scope.minDate;
            };
            $scope.endMaxDate = function () {
                return $scope.event.endTime || $scope.minDate;
            };


            $scope.resetPlaceholder = function () {

                if (!$("input[placeholder='Enter a location']").length) {
                    $timeout($scope.resetPlaceholder, 100);
                    return;
                }

                $("input[placeholder='Enter a location']").attr('placeholder', '');
            };

            $scope.$watch('event.endTime', function (newValue) {
                $scope.event.rsvpEndDate = newValue;
            });

            $scope.$watch('location.details', function (newValue) {
                if (!newValue) {
                    return;
                }

                $.ajax({
                    url: "https://maps.googleapis.com/maps/api/timezone/json?location=" +
                        newValue.geometry.location.lat() + "," +
                        newValue.geometry.location.lng() + "&timestamp="
                        + (Math.round((new Date().getTime()) / 1000)).toString() + "&sensor=false",
                }).done(function (response) {
                    $scope.event.utcOffset = response.dstOffset + response.rawOffset;
                });

            });

            $scope.gliOptions = {
                showSummary: true
            };

            $scope.addNewTicket = function() {
                $scope.event.tickets.push({title: '', price: 10, endTime: new Date(), quantity: 1});
            }

            $scope.init = function () {
                if ($scope.isPromoter()) {
                    $scope.data.selectedIndex = 3;
                }

                if ($scope.event) {
                    return;
                }

                var d1 = new Date(),
                    d2 = new Date(d1),
                    d3 = new Date(d1);

                d2.setHours(d1.getHours() + 12);
                d1.setHours(d1.getHours() + 6);

                $scope.event = {
                    title: '',
                    guestLists: [],
                    time: d1,
                    endTime: d2,
                    type: 1,
                    rsvpType: 3,
                    additionalGuests: 0,
                    isRsvpCapacityLimited: false,
                    rsvpEndDate: d3,
                    tickets: []
                }
                $scope.addNewTicket();
            };

        }]);
