'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService', '$mdDialog', 'dialogService', '$rootScope', '$state',
        function($scope, subscriptionsService, $mdDialog, dialogService, $rootScope, $state) {
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
                var selectedPlan = $scope.plans[index],
                    setSubscriptionError = function(rejection) {
                        var alert = $mdDialog.alert()
                                .content(rejection.data.message)
                                .ok('OK');
                        alert._options.template = '<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}" style="padding: 20px"><md-dialog-content role="document" tabIndex="-1" style="padding: 0 20px"><h2 class="md-title">{{ dialog.title }}</h2><p ng-bind-html="dialog.content" style="font-size: 20px; text-align: left"></p></md-dialog-content><div class="md-actions"><md-button ng-if="dialog.$type == \'confirm\'" ng-click="dialog.abort()" class="md-primary">{{ dialog.cancel }}</md-button><md-button ng-click="dialog.hide()" class="md-primary">{{ dialog.ok }}</md-button></div></md-dialog>';
                        $mdDialog.show(alert);
                    };
                if ($scope.allowToSelect(index)) {
                    if (selectedPlan.pricePolicies[0].prices[0].amount > 0) {
                        var scope = $scope.$new();
                        scope.close = function() {
                            $mdDialog.hide();
                        };
                        scope.selectedPlan = {
                            id: selectedPlan.id,
                            pricePolicyId: selectedPlan.pricePolicies[0].id,
                            name: selectedPlan.name,
                            total: '$'+selectedPlan.pricePolicies[0].prices[0].amount / 100,
                            promo: {
                                applied: false,
                                invalid: false
                            },
                            hasPromo: selectedPlan.hasPromo
                        };
                        scope.applyPromo = function() {
                            var code = scope.selectedPlan.promo.code ? scope.selectedPlan.promo.code.trim() : '';
                            if (code !== '') {
                                scope.selectedPlan.promo.invalid = false;
                                $scope.waiting = true;
                                subscriptionsService.applyPromo(code).then(
                                    function(response) {
                                        if (response.dataTotalCount === 0) {
                                            scope.selectedPlan.promo.invalid = true;
                                        } else {
                                            scope.selectedPlan.promo.code = code;
                                            scope.selectedPlan.promo.applied = true;
                                            scope.selectedPlan.totalBeforePromo = scope.selectedPlan.total;
                                            scope.selectedPlan.total = '$'+response.pricePolicies[0].prices[0].amount / 100;
                                        }
                                    }
                                ).finally(function(){
                                    $scope.waiting = false;
                                });
                            }
                        };
                        scope.undoPromo = function() {
                            $scope.waiting = true;
                            subscriptionsService.applyPromo(scope.selectedPlan.promo.code).then(
                                function(response) {
                                    if (response.dataTotalCount === 0) {
                                        scope.selectedPlan.promo.invalid = true;
                                    } else {
                                        scope.selectedPlan.promo.applied = false;
                                        scope.selectedPlan.totalBeforePromo = scope.selectedPlan.total;
                                        scope.selectedPlan.total = '$'+response.pricePolicies[0].prices[0].amount / 100;
                                    }
                                }
                            ).finally(function(){
                                $scope.waiting = false;
                            });
                        };
                        scope.process = function(form){
                            var errorMessage = [];
                            if (form && form.$invalid) {
                                var errors = {
                                    required: {
                                        number: 'Please Enter Card Number Title',
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
                            if (!scope.terms) {
                                errorMessage.push('You must accept terms and conditions');
                            }
                            if (errorMessage.length > 0) {
                                dialogService.error(errorMessage.join(', '));
                                return;
                            }
                            $scope.waiting = true;
                            subscriptionsService.setUserSubscription({
                                subscriptionId: scope.selectedPlan.id,
                                pricePolicyId: scope.selectedPlan.pricePolicyId,
                                card: scope.cardData
                            }).then(
                                function(response){
                                    $rootScope.currentUser.subscription = response.data.subscription;
                                    scope.close();
                                    $state.go('main.welcome');
                                },
                                function(rejection){
                                    setSubscriptionError(rejection);
                                }
                            ).finally(function(){
                                $scope.waiting = false;
                            });
                        };
                        $mdDialog.show({
                            scope: scope,
                            templateUrl: 'app/templates/payment-popup.html'
                        });
                    } else {
                        $scope.waiting = true;
                        subscriptionsService.setUserSubscription({
                            subscriptionId: selectedPlan.id,
                            pricePolicyId: selectedPlan.pricePolicies[0].id
                        }).then(
                            function(response){
                                $rootScope.currentUser.subscription = response.data.subscription;
                                $state.go('main.welcome');
                            },
                            function(rejection){
                                setSubscriptionError(rejection);
                            }
                        ).finally(function(){
                            $scope.waiting = false;
                        });
                    }
                }
            };
        }]);