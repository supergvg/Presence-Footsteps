'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog', 'subscriptionsService', 'stripe',
        function($scope, $mdDialog, subscriptionsService, stripe) {
            $scope.loading = true;
            $scope.invoices = [
                {
                    date: '01/26/2016',
                    amount: '12$'
                },
                {
                    date: '01/26/2016',
                    amount: '12$'
                }
            ];
            $scope.loading = true;
            $scope.plans = [];
            $scope.combinedPlanWith = {};
            
            subscriptionsService.getAllSubscriptions().then(
                function(data){
                    $scope.plans = data.plans;
                    $scope.combinedPlanWith = data.combinedPlanWith;
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
            
            $scope.invoiceDetails = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/invoice-details.html'
                });  
            };

            $scope.selectPlan = function(index) {
                var selectedPlan = $scope.plans[index];
                if ($scope.combinedPlanWith[selectedPlan.keyForUI] && $scope.combinedPlanWith[selectedPlan.keyForUI].model !== selectedPlan.keyForUI) {
                    selectedPlan = $scope.combinedPlanWith[selectedPlan.keyForUI].options[0];
                }
                if (selectedPlan.paymentType === 'select') {
                    if (selectedPlan.amount > 0) {
                        stripe.openCheckout({description: selectedPlan.name + ' plan', amount: selectedPlan.amount});
                    } else {
                        
                    }
                }
            };
        }]);
