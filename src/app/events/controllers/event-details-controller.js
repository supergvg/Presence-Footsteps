'use strict';

angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', 'uploaderService', '$rootScope', '$location', '$filter', '$state',
        function ($scope, $mdDialog, eventsService, dialogService, uploaderService, $rootScope, $location, $filter, $state) {
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
                'Celebration',
                'School',
                'Others'
            ];
            $scope.selectedIndex = parseInt($location.search().view) || 0;
            $scope.dateOptions = {
                startingDay: 1,
                showWeeks: false
            };
            $scope.minuteStep = 15;
            $scope.utcOffset = 0;
            $scope.dt = {
                startEventDateTime: new Date(Date.now()),
                endEventDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                endEventRsvpDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };
            $scope.eventStarted = false;
            $scope.eventFinished = false;
            $scope.minDate = Date.now();
            $scope.endMinDate = function() {
                return $scope.dt.startEventDateTime.getTime();
            };
            $scope.endMaxDate = function() {
                return $scope.dt.endEventDateTime.getTime();
            };
            $scope.maxTicketDate = function() {
                return $scope.dt.startEventDateTime.getTime() - 3 * 60 * 60 * 1000;
            };
            
            $scope.previewOptions = {
                hideEdit: true
            };
            $scope.location = {
                value: '',
                formatted: ''
            };
            $scope.tickets = [];
            $scope.gliOptions = {
                showSummary: true,
                details: true
            };

            $scope.$watch('selectedIndex', function(newValue) {
                $location.search('view', newValue);
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
                            (Math.round(Date.now() / 1000)).toString() + '&sensor=false'
                    }).done(function(response) {
                        $scope.utcOffset = response.dstOffset + response.rawOffset;
                    });
                    if (newValue.adr_address.indexOf(newValue.name) + 1) {
                        $scope.location.formatted = newValue.adr_address;
                    } else {
                        $scope.location.formatted = '<span class="venue-name">'+newValue.name+', </span>'+newValue.adr_address;
                    }
                }
            });

            $scope.$watch('dt.endEventDateTime', function(newValue) {
                if (newValue.getTime() < $scope.dt.endEventRsvpDateTime.getTime()) {
                    $scope.dt.endEventRsvpDateTime.setTime(newValue.getTime());
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
                    'background-image': 'url("' + $scope.event.invitePicture + '")',
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
                    readOnly: true,
                    verticalScroll: false
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

            $scope.timeValid = function() {
                $scope.startEventTimeInvalid = false;
                $scope.endEventTimeInvalid = false;
                if ($scope.dt.endEventRsvpDateTime.getTime() > $scope.dt.endEventDateTime.getTime()) {
                    $scope.dt.endEventRsvpDateTime.setTime($scope.dt.endEventDateTime.getTime());
                }
                $scope.startEventTimeInvalid = false;
                var now = new Date(Date.now()),
                    locationDateTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + $scope.utcOffset * 1000);
                if ($scope.dt.startEventDateTime.getTime() < locationDateTime.valueOf()) {
                    $scope.startEventTimeInvalid = true;
                }
                if ($scope.dt.startEventDateTime.getTime() > $scope.dt.endEventDateTime.getTime()) {
                    $scope.endEventTimeInvalid = true;
                }
                if ($scope.startEventTimeInvalid || $scope.endEventTimeInvalid) {
                    return false;
                }
                return true;
            };

            $scope.next = function(form) {
                if ([0, 1, 3].indexOf($scope.selectedIndex) !== -1) {
                    var errorMessage = [];
                    if (form && form.$invalid) {
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
                                    angular.forEach(value, function(value1){
                                        if (errors[key][value1.$name]) {
                                            errorMessage.push(errors[key][value1.$name]);
                                        }
                                    });
                                }
                            });
                        }
                    }
                    if (!$scope.timeValid()) {
                        if ($scope.eventFinished) {
                            errorMessage.push('Cant Update Event. Event has been finished');
                        }
                        if ($scope.startEventTimeInvalid && !$scope.eventStarted) {
                            errorMessage.push('Cant Create Event in the Past');
                        }
                        if ($scope.endEventTimeInvalid) {
                            errorMessage.push('End time has to be after start time');
                        }
                    }
                    if (!$scope.location.details) {
                        errorMessage.push('Please enter the city of the event or event location');
                    }
                    if ($scope.event.type === 3 && !$scope.isHasOneTicket()) {
                        errorMessage.push('Please specify at least one ticket tier');
                    }
                    if (errorMessage.length > 0) {
                        dialogService.error(errorMessage.join(', '));
                        return;
                    }
                    
                    $scope.savingEvent = true;
                    $scope.event.location = $scope.location.formatted;
                    $scope.event.time = $scope.convertDateTime($scope.dt.startEventDateTime);
                    $scope.event.endTime = $scope.convertDateTime($scope.dt.endEventDateTime);
                    $scope.event.rsvpEndDate = $scope.convertDateTime($scope.dt.endEventRsvpDateTime);
                    eventsService.createEvent($scope.event).then(
                        function(res) {
                            $scope.event.id = res.id;
                            $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 4);
                            $scope.event.invitePicture = res.invitePicture;
                            $scope.event.rsvpUrl = res.rsvpUrl;
                            $scope.event.ticketingUrl = res.ticketingUrl;
                            $scope.event.facebookPageUrl = res.facebookPageUrl;
                            $scope.event.instagrammPageUrl = res.instagrammPageUrl;
                            $scope.event.twitterPageUrl = res.twitterPageUrl;
                            dialogService.success('Event ' + res.title + ' saved');
                        }, function() {
                            dialogService.error('There was a problem saving your event, please try again');
                        }
                    ).finally(function() {
                        $scope.savingEvent = false;
                    });

                    return;
                }

                $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 4);
            };
            
            $scope.convertDateTime = function(date) {
                var convertDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000),
                    dateStr = convertDate.toISOString().replace(/\..+$/, ''),
                    offset = new Date(Math.abs($scope.utcOffset) * 1000);
                return dateStr+($scope.utcOffset < 0 ? '-' : '+')+('0'+offset.getUTCHours()).slice(-2)+':'+('0'+offset.getUTCMinutes()).slice(-2);
            };
            
            $scope.previous = function() {
                $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
            };

            $scope.clearLocation = function() {
                delete $scope.location.details;
            };
            
            $scope.checkPermission = function(event) {
                var confirm = $mdDialog.confirm({
                    title: 'This is a paid feature. Would you like to upgrade your plan to unlock this feature?',
                    ok: 'Upgrade',
                    cancel: 'Close',
                    targetEvent: event
                });
                $mdDialog.show(confirm).then(function() {
                    $state.go('main.user', {view: 2});
                });
            };

            $scope.init = function() {
                if ($scope.isPromoter()) {
                    $scope.selectedIndex = 3;
                }
                if ($scope.event) {
                    $scope.location.details = {};
                    $scope.location.formatted = $scope.event.location;
                    $scope.location.value = $scope.location.formatted.replace(/<[^>]+>/gm, '');
                    
                    var parseDate = $scope.event.time.split(/[^0-9]/);
                    $scope.utcOffset = $scope.event.time.substr(19, 1) + (parseDate[6] * 60 * 60 + parseDate[7] * 60);
                    $scope.dt.startEventDateTime = $filter('ignoreTimeZone')($scope.event.time);
                    $scope.dt.endEventDateTime = $filter('ignoreTimeZone')($scope.event.endTime);
                    $scope.dt.endEventRsvpDateTime = $filter('ignoreTimeZone')($scope.event.rsvpEndDate);
                    if ($scope.dt.startEventDateTime < Date.now()) {
                        $scope.eventStarted = true;
                    }
                    if ($scope.dt.endEventDateTime < Date.now()) {
                        $scope.eventFinished = true;
                    }
                    if ($scope.event.type === 3) {
                        $scope.getTickets($scope.event.id);
                    }
                    return;
                }
                
                $scope.event = {
                    title: '',
                    guestLists: [],
                    time: '',
                    endTime: '',
                    type: 1,
                    rsvpType: 3,
                    additionalGuests: 0,
                    isRsvpCapacityLimited: false,
                    rsvpEndDate: ''
                };
            };

        }]);
