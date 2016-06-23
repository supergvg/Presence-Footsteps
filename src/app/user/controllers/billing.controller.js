'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog', 'paymentsService',
        function($scope, $mdDialog, paymentsService) {
            $scope.invoices = [];
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
                        $scope.cardData = data.data;
                    }
                }
            ).finally(function(){
                $scope.loadingCard = false;
            });
            
            $scope.printCard = function() {
                return 'XXXX XXXX XXXX '+($scope.cardData.number === '' ? 'XXXX' : $scope.cardData.number.slice(-4));
            };
            
            $scope.editPaymentInfo = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
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