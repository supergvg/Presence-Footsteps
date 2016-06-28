'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog', 'paymentsService', 'dialogService',
        function($scope, $mdDialog, paymentsService, dialogService) {
            $scope.invoices = [];
            $scope.cardDataSaved = {
                number: 'XXXX'
            };
            $scope.cardDataLoaded = false;
            $scope.cardData = {
                number: '',
                cvc: '',
                expiryMonth: '',
                expiryYear: '',
                zipCode: ''
            };
            $scope.options = {
                'billing': true
            };
            $scope.loadingInvoices = true;
            $scope.loadingCard = true;
            
            paymentsService.getCharges().then(
                function(data) {
                    if (data.data && data.data.length > 0) {
                        $scope.invoices = data.data;
                    }
                }
            ).finally(function(){
                $scope.loadingInvoices = false;
            });

            paymentsService.getCard().then(
                function(data) {
                    if (data.data) {
                        $scope.cardLoaded(data.data);
                    }
                }
            ).finally(function(){
                $scope.loadingCard = false;
            });
            
            $scope.cardLoaded = function(data) {
                $scope.cardData = data;
                $scope.cardDataSaved.number = $scope.cardData.number;
                $scope.cardData.number = '';
                $scope.cardData.cvc = '';
                $scope.cardDataLoaded = true;
            };
            
            $scope.editPaymentInfo = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                scope.update = function(form) {
                    var errorMessage = [];
                    if (form && form.$invalid) {
                        var errors = {
                            required: {
                                number: 'Please Enter Card Number',
                                cvc: 'Please Enter Card CVC Code',
                                exp_month: 'Please Enter Card Expiration Month',
                                exp_year: 'Please Enter Card Expiration Year'
                            },
                            pattern: {
                                number: 'Please Enter Correct Card Number',
                                cvc: 'Please Enter Correct Card CVC Code',
                                exp_month: 'Please Enter Correct Card Expiration Month',
                                exp_year: 'Please Enter Correct Card Expiration Year'
                            },
                            max: {
                                exp_month: 'Please Enter Correct Card Expiration Month'
                            },
                            min: {
                                exp_year: 'Please Enter Correct Card Expiration Year'
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
                    $scope.savingCard = true;
                    paymentsService.setCard($scope.cardData).then(
                        function(data) {
                            if (data.data) {
                                $scope.cardLoaded(data.data);
                            }
                        }
                    ).finally(function(){
                        $scope.savingCard = false;
                    });
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/payment-info.html'
                });  
            };
            
            $scope.invoiceDetails = function(invoice) {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                scope.invoice = invoice;
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/invoice-details.html'
                });  
            };
        }
    ]);