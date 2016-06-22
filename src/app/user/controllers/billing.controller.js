'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog', 'paymentsService',
        function($scope, $mdDialog, paymentsService) {
            $scope.invoices = [];
            $scope.options = {
                'billing': true
            };
            $scope.loading = true;
            
            paymentsService.getCharges().then(
                function(data) {
                    if (data.data && data.data.length > 0) {
                        $scope.invoices = data.data;
                    }
                }
            ).finally(function(){
                $scope.loading = false;
            });
            
            $scope.editPaymentInfo = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/square-dialog.html'
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