angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', 'uploaderService', '$rootScope', '$location',
        function ($scope, $mdDialog, eventsService, dialogService, uploaderService, $rootScope, $location) {
            'use strict';

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
            $scope.selectedIndex = parseInt($location.search().view) || 0;
            $scope.dateOptions = {
                startingDay: 1,
                showWeeks: false
            };
            $scope.hourStep = 1;
            $scope.minuteStep = 15;
            $scope.showMeridian = true;
            $scope.previewOptions = {
                hideEdit: true
            };
            $scope.location = {
                value: '',
                formatted: ''
            };
            $scope.tickets = [];
            $scope.minDate = Date.now();
            $scope.gliOptions = {
                showSummary: true,
                details: true
            };

            $scope.$watch('selectedIndex', function(newValue) {
                $location.search('view', newValue);
            });
            
            $scope.$watch('event.endTime', function(newValue) {
                $scope.event.rsvpEndDate = newValue;
            });

            $scope.$watch('location.details', function(newValue) {
                if (!newValue) {
                    return;
                }
                if (newValue.geometry) {
                    $.ajax({
                        url: 'https://maps.googleapis.com/maps/api/timezone/json?location=' +
                            newValue.geometry.location.lat() + ',' +
                            newValue.geometry.location.lng() + '&timestamp=' +
                            (Math.round((new Date().getTime()) / 1000)).toString() + '&sensor=false'
                    }).done(function (response) {
                        $scope.event.utcOffset = response.dstOffset + response.rawOffset;
                    });
                    if (newValue.adr_address.indexOf(newValue.name) + 1) {
                        $scope.location.formatted = newValue.adr_address;
                    } else {
                        $scope.location.formatted = '<span class="venue-name">'+newValue.name+', </span>'+newValue.adr_address;
                    }
                }
            });

            $scope.isStaff = function() {
                return $rootScope.isStaff();
            };

            $scope.isPromoter = function() {
                return $rootScope.isPromoter();
            };

            $scope.getSelected = function(idx) {
                return ($scope.selectedIndex === idx);
            };

            $scope.getEventInvite = function(height) {
                return {
                    'background-image': 'url(' + $scope.event.invitePicture + ')',
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-repeat': 'no-repeat',
                    'background-size': 'contain'
                };
            };
            
            $scope.onInviteSelected = function(files) {
                if (!files || files.length === 0) {
                    return;
                }
                $scope.upload(files[0]);
            };
            
            $scope.upload = function(files) {
                $scope.fetchingData = true;
                uploaderService.uploadEventInvite(files, $scope.event.id).then(function (res) {
                        $scope.event.invitePicture = res;
                        dialogService.success('Invite saved');

                    },
                    function() {
                        dialogService.error('There was a problem saving your image please try again');
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

            $scope.onAddGLClicked = function(ev, instanceType) {
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

            $scope.displayErrorMessage = function(field) {
                return false;
                //return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

            $scope.timeValid = function() {

                var now = Date.now(),
                    dNow = new Date(now);
                if ($scope.event.utcOffset) {
                    now = now + (dNow.getTimezoneOffset() * 60000) + ($scope.event.utcOffset * 1000);
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

            $scope.next = function (form) {
                if ([0, 2, 3].indexOf($scope.selectedIndex) !== -1) {
                    if ($scope.event.rsvpEndDate < $scope.event.time) {
                        $scope.event.rsvpEndDate = $scope.event.time;
                    }
                    if (form && form.$invalid || !$scope.timeValid() || !$scope.location.details) {
                        var errorMessage = [];
                        if (form) {
                            var errors = {
                                required: {
                                    title: 'Please Enter Event Title',
                                    category: 'Please Select Event Category',
                                    /*location: 'Please Enter Event Location',*/
                                    capacity: 'Please Enter Event Capacity'
                                },
                                pattern: {
                                    title: 'Event Title can only contain alphabets, digits and spaces'
                                },
                                number: {
                                    capacity: 'Please enter numbers only'
                                }
                            };
                            angular.forEach(form.$error, function(value, key){
                                if (errors[key]) {
                                    angular.forEach(value, function(value1, key1){
                                        if (errors[key][value1.$name]) {
                                            errorMessage.push(errors[key][value1.$name]);
                                        }
                                    });
                                }
                            });
                        }
                        if ($scope.timeInvalid || form.$error['date-disabled']) {
                            errorMessage.push('Cant Create Event in the Past');
                        }
                        if ($scope.endTimeInvalid) {
                            errorMessage.push('End time has to be after start time');
                        }
                        if (!$scope.location.details) {
                            errorMessage.push('Please enter the city of the event or event location');
                        }
                        dialogService.error(errorMessage.join(', '));
                        $scope.showValidation = true;
                        return;
                    }
                    $scope.savingEvent = true;
                    $scope.event.location = $scope.location.formatted;
                    eventsService.createEvent($scope.event).then(
                        function (res) {
                            $scope.event.id = res.id;
                            $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 4);
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

                $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 4);
            };
            
            $scope.previous = function () {
                $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
            };

            $scope.clearLocation = function() {
                delete $scope.location.details;
            };

            $scope.endMinDate = function () {
                return $scope.event.time || $scope.minDate;
            };
            $scope.endMaxDate = function () {
                return $scope.event.endTime || $scope.minDate;
            };

            $scope.addNewTicket = function() {
                $scope.event.tickets.push({title: '', price: 10, endTime: new Date(), quantity: 1});
            };

            $scope.init = function () {
                if ($scope.isPromoter()) {
                    $scope.selectedIndex = 3;
                }
                if ($scope.event) {
                    $scope.location.details = {};
                    $scope.location.formatted = $scope.event.location;
                    $scope.location.value = $scope.location.formatted.replace(/<[^>]+>/gm, '');
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
                    rsvpEndDate: d3
                };
            };

        }]);
