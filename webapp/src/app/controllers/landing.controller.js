'use strict';

angular.module('gliist')
    .controller('LandingCtrl', ['$scope', '$stateParams', 'dialogService', 'eventsService', '$location', '$mdDialog',
        function ($scope, $stateParams, dialogService, eventsService, $location, $mdDialog) {
            var companyName = $stateParams.companyName,
                eventName = $stateParams.eventName,
                token = $stateParams.token;

            $scope.public = angular.isUndefined(token);
            $scope.event = {};
            $scope.message = '';
            
            $scope.eventReceived = function(data) {
                $scope.event = data;
                $scope.rsvp.plus = 0;
                if ($scope.event.event.isRsvpExpired) {
                    $mdDialog.show({
                        template: '<md-dialog><md-dialog-content style="padding: 50px;font-size:20px;"><b>Oops! RSVP for this event has expired.</b></md-dialog-content></md-dialog>'
                    });
                }
            };
            
            if ($scope.public) {
                eventsService.getPublicEventDetails('rsvp', companyName, eventName).then(
                    $scope.eventReceived,
                    function (data) {
                        dialogService.error(data.message);
                    }
                );
            } else {
                eventsService.getPersonalEventDetails('rsvp', token).then(
                    $scope.eventReceived,
                    function (data) {
                        dialogService.error(data.message);
                    }
                );
            }
            
            $scope.getCompanyLogo = function () {
                if (!$scope.event || !$scope.event.company) {
                    return;
                }

                if (!$scope.event.company.users) {
                    return $scope.event.company.logo;
                }

                var retVal;
                angular.forEach($scope.event.company.users, function (user) {
                    if (user.profilePictureUrl) {
                        retVal = user.profilePictureUrl;
                    }
                });

                return retVal;
            };

            $scope.displayErrorMessage = function (field) {
                return false;
                //return ($scope.showValidation) || (field.$touched && field.$error.required);
            };
            
            $scope.getPageURL = function() {
                return $location.absUrl();
            };
            
            $scope.rsvp = {};
            $scope.onSubmitClicked = function (form) {
                if (form && form.$invalid) {
                    var errors = {
                            required: {
                                name: 'Name is required',
                                email: 'Email is required'
                            },
                            pattern: {
                                name: 'Last Name is required'
                            },  
                            email: {
                                email: 'Not valid email'
                            },
                            max: {
                                plus: 'Number of additional guests cannot exceed ' + $scope.event.event.additionalGuests + ' people'
                            }
                        },
                        errorMessage = [];
                    angular.forEach(form.$error, function (value, key) {
                        angular.forEach(value, function (value1, key1) {
                            errorMessage.push(errors[key][value1.$name]);
                        });
                    });
                    dialogService.error(errorMessage.join(', '));
                    $scope.showValidation = true;
                    return;
                }
                if (!$scope.waiting) {
                    $scope.waiting = true;
                    $scope.success = false;
                    if ($scope.public) {
                        eventsService.confirmRSVPPublicEvent({eventId: $scope.event.event.id, email: $scope.rsvp.email, name: $scope.rsvp.name, additionalGuests: $scope.rsvp.plus}).then(
                            function() {
                                $scope.message = 'Thank you! You have been added to the event guest list!';
                                $scope.success = true;
                            }, function(data) {
                                $scope.message = data.message || data.Message;
                                $scope.success = true;
                            }
                        ).finally(function(){
                            $scope.waiting = false;
                        });
                    } else {
                        eventsService.confirmRSVPPersonalEvent({eventId: $scope.event.event.id, guestId: $scope.event.guest.id, additionalGuests: $scope.rsvp.plus}).then(
                            function() {
                                $scope.message = 'Thank you! You have been added to the event guest list!';
                                $scope.success = true;
                            }, function(data) {
                                $scope.message = data.message || data.Message;
                                $scope.success = true;
                            }
                        ).finally(function(){
                            $scope.waiting = false;
                        });
                    }
                }
            };
        }])
    .controller('LandingTicketCtrl', ['$scope', '$stateParams', 'dialogService', 'eventsService',
        function ($scope, $stateParams, dialogService, eventsService) {
            var companyName = $stateParams.companyName,
                eventName = $stateParams.eventName,
                token = $stateParams.token;

            $scope.public = angular.isUndefined(token);
            $scope.event = {};
            if ($scope.public) {
                eventsService.getPublicEventDetails('tickets', companyName, eventName).then(function (data) {
                    $scope.event = data;
                }, function (data) {
                    dialogService.error(data.message);
                });
            } else {
                eventsService.getPersonalEventDetails('tickets', token).then(function (data) {
                    $scope.event = data;
                }, function (data) {
                    dialogService.error(data.message);
                });
            }

            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

        }]);