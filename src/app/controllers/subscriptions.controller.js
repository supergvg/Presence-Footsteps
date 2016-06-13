'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', 'stripe', '$mdDialog',
        function($scope, subscriptionsService, stripe, $mdDialog) {
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
            
            $scope.selectPlan = function(index) {
                var selectedPlan = $scope.plans[index];
                if ($scope.combinedPlanWith[selectedPlan.keyForUI] && $scope.combinedPlanWith[selectedPlan.keyForUI].model !== selectedPlan.keyForUI) {
                    selectedPlan = $scope.combinedPlanWith[selectedPlan.keyForUI].options[0];
                }
                if (selectedPlan.paymentType === 'select') {
                    if (selectedPlan.amount > 0) {
                        var scope = $scope.$new();
                        scope.close = function() {
                            $mdDialog.hide();
                        };
                        $mdDialog.show({
                            scope: scope,
                            templateUrl: 'app/templates/payment-popup.html'
                        });            
                        stripe.openCheckout({description: selectedPlan.name + ' plan', amount: selectedPlan.amount});
                    } else {
                        
                    }
                }
            };
        }]);
