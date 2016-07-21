'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog', 'paymentsService', 'dialogService', 'EnvironmentConfig', '$window', '$rootScope',
        function($scope, $mdDialog, paymentsService, dialogService, EnvironmentConfig, $window, $rootScope) {
            var card = {
                    cardDataSaved: {
                        number: 'XXXX'
                    },
                    cardData: {
                        number: '',
                        cvc: '',
                        expiryMonth: '',
                        expiryYear: '',
                        zipCode: '',
                        isDefault: false
                    }
                };
            $scope.cards = [angular.extend({}, card), angular.extend({}, card)];
            $scope.invoices = [];
            $scope.cardsDataLoaded = false;
            $scope.options = {
                'billing': true
            };
            
            $scope.initCard = function(card, index) {
                $scope.cards[index].cardData = angular.extend({}, card);
                $scope.cards[index].cardData.number = '';
                $scope.cards[index].cardData.cvc = '';
                $scope.cards[index].cardDataSaved = angular.extend({}, card);
            };
            
            $scope.loadParts = function() {
                $scope.loadingInvoices = true;
                paymentsService.getCharges().then(
                    function(data) {
                        if (data.data && data.data.length > 0) {
                            $scope.invoices = data.data;
                        }
                    }
                ).finally(function(){
                    $scope.loadingInvoices = false;
                });
                $scope.loadingCards = true;
                paymentsService.getCards().then(
                    function(data) {
                        if (data.data) {
                            angular.forEach(data.data, function(card, key){
                                $scope.initCard(card, key);
                            });
                            $scope.cardsDataLoaded = true;
                        }
                    }
                ).finally(function(){
                    $scope.loadingCards = false;
                });
            };
            
            $scope.loadParts();
            
            $rootScope.$watch('currentUser.subscription', function(newValue, oldValue) {
                if (!newValue || !oldValue || (newValue.id === oldValue.id && newValue.pricePolicy.id === oldValue.pricePolicy.id)) {
                    return;
                }
                $scope.loadParts();
            });
            
            $scope.editPaymentInfo = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                scope.update = function(form, index) {
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
                                    if (errors[key][value1.$name] && (!$scope.cards[index].cardData.cardId || ($scope.cards[index].cardData.cardId && ['number', 'cvc'].indexOf(value1.$name) === -1))) {
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
                    if ($scope.cards[index].cardData.cardId) {
                        $scope.savingCard = true;
                        paymentsService.updateCard($scope.cards[index].cardData).then(
                            function(data) {    
                                $scope.initCard(data.data, index);
                            }
                        ).finally(function(){
                            $scope.savingCard = false;
                        });
                    } else {
                        $scope.savingCard = true;
                        paymentsService.addCard($scope.cards[index].cardData).then(
                            function(data) {
                                $scope.initCard(data.data, index);
                            }
                        ).finally(function(){
                            $scope.savingCard = false;
                        });
                    }
                };
                scope.delete = function(index) {
                    if ($scope.cards[index].cardData.cardId) {
                        $scope.savingCard = true;
                        paymentsService.deleteCard($scope.cards[index].cardData.cardId).then(
                            function(data) {    
                                $scope.initCard(data.data, index);
                            }
                        ).finally(function(){
                            $scope.savingCard = false;
                        });
                    }
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/payment-info.html'
                });  
            };
            
            $scope.getExportPdfUrl = function(chargeId) {
                return EnvironmentConfig.payments_api+'charges/export?id='+chargeId+'&authToken='+$window.localStorage.access_token;
            };
        }
    ]);