'use strict';

angular.module('gliist')
    .controller('LandingCtrl', ['$scope', '$stateParams', 'dialogService', 'eventsService',
        function ($scope, $stateParams, dialogService, eventsService) {
            var companyName = $stateParams.companyName,
                eventName = $stateParams.eventName,
                token = $stateParams.token;
        
            $scope.public = angular.isUndefined(token);
            $scope.event = {};
            if ($scope.public) {
                eventsService.getPublicEventDetails('rsvp', companyName, eventName).then(function(data){
                    $scope.event = data;
                }, function(data) {
                    dialogService.error(data.message);
                });
            } else {
                eventsService.getPersonalEventDetails('rsvp', token).then(function(data){
                    $scope.event = data;
                }, function(data) {
                    dialogService.error(data.message);
                });
            }

            $scope.displayErrorMessage = function(field){
                return false;
//                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };
            
            $scope.rsvp = {};
            $scope.onSubmitClicked = function(form) {
                if (form && form.$invalid) {
                    var errors = {
                        required: {
                            name: 'Name is required',
                            email: 'Email is required',
                        },
                        email: {
                            email: 'Not valid email'
                        },
                        max: {
                            plus: 'Number of additional guests cannot exceed '+$scope.event.event.additionalGuests+' people'
                        }
                    },
                    errorMessage = [];
                    angular.forEach(form.$error, function(value, key){
                        angular.forEach(value, function(value1, key1){
                            errorMessage.push(errors[key][value1.$name]);
                        });
                    });
                    dialogService.error(errorMessage.join(', '));
                    $scope.showValidation = true;
                    return;
                }
                if ($scope.public) {
                    eventsService.confirmRSVPPublicEvent({eventId: $scope.event.event.id, email: $scope.rsvp.email, name: $scope.rsvp.name, additionalGuests: $scope.rsvp.plus}).then(function(){
                        dialogService.success('Thank you! You are added to the guest list');
                        $scope.success = true;
                    }, function(data){
                        dialogService.error(data.message || data.Message);
                    });
                } else {
                    eventsService.confirmRSVPPersonalEvent({eventId: $scope.event.event.id, guestId: $scope.event.guest.id, additionalGuests: $scope.rsvp.plus}).then(function(){
                        dialogService.success('Thank you! You are added to the guest list');
                        $scope.success = true;
                    }, function(data){
                        dialogService.error(data.message || data.Message);
                    });
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
                eventsService.getPublicEventDetails('tickets', companyName, eventName).then(function(data){
                    $scope.event = data;
                }, function(data) {
                    dialogService.error(data.message);
                });
            } else {
                eventsService.getPersonalEventDetails('tickets', token).then(function(data){
                    $scope.event = data;
                }, function(data) {
                    dialogService.error(data.message);
                });
            }

            $scope.displayErrorMessage = function(field){
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };
            
        }]);