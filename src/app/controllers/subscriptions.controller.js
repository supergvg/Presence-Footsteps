'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', 'stripe', '$mdDialog', 'dialogService',
        function($scope, subscriptionsService, stripe, $mdDialog, dialogService) {
            $scope.loading = true;
            $scope.plans = [];
            
            subscriptionsService.getSubscriptions().then(
                function(data) {
                    $scope.plans = data.data;
                }
            ).finally(function(){
                $scope.loading = false; 
            });
            
            $scope.allowToSelect = function(index) {
                return $scope.plans[index].pricePolicies.length > 0;
            };
            
            $scope.selectPlan = function(index) {
                var selectedPlan = $scope.plans[index];
                
                if ($scope.allowToSelect(index)) {
                    if (selectedPlan.pricePolicies[0].prices[0].amount > 0) {
                        var scope = $scope.$new();
                        scope.close = function() {
                            $mdDialog.hide();
                        };
                        scope.selectedPlan = {
                            name: selectedPlan.name,
                            total: '$'+selectedPlan.pricePolicies[0].prices[0].amount / 100
                        };
                        scope.process = function(form){
                            var errorMessage = [];
                            if (form && form.$invalid) {
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
                            if (errorMessage.length > 0) {
                                dialogService.error(errorMessage.join(', '));
                                return;
                            }                            
                            
                            
                            
                            console.log(form);
                        };
                        $mdDialog.show({
                            scope: scope,
                            templateUrl: 'app/templates/payment-popup.html'
                        });            
//                        stripe.openCheckout({description: selectedPlan.name + ' plan', amount: selectedPlan.amount});
                    } else {
                        
                    }
                }
            };
        }]);