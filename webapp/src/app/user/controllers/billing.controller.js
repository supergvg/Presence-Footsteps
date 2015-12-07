'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog',
        function($scope, $mdDialog) {
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
            
            $scope.plans = [
                {
                    title: 'Basic',
                    price: 'FREE',
                    features: [
                        'up to 100 guest checkin',
                        '2 devices',
                        '2 accounts',
                        'No support'
                    ],
                    active: true,
                    expires: '03/01/2016'
                },
                {
                    title: 'Pay as you go',
                    price: '$ 59/event',
                    features: [
                        'up to 1000 guest checkins',
                        '5 devices',
                        'RSVP feature',
                        'unlimited email invites',
                        'promoter contributor access',
                        'unlimited sub accounts',
                        'Offline mode',
                        'No Support'
                    ],
                    active: false
                },
                {
                    title: 'Monthly',
                    price: '$ 260/month',
                    features: [
                        'up to 1000 guest checkins',
                        '5 devices',
                        'RSVP feature',
                        'unlimited email invites',
                        'promoter contributor access',
                        'unlimited sub accounts',
                        'Offline mode'
                    ],
                    active: false
                },
                {
                    title: 'One year',
                    price: '$ 3000/year',
                    features: [
                        'Same services as monthly',
                        '10% off pay up front'
                    ],
                    active: false
                },
                {
                    title: 'Enterprise',
                    price: '',
                    features: [
                        'Access to all our features',
                        'Dedicated account manager'
                    ],
                    active: false
                }
            ];
            
            $scope.squareDialog = function() {
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
        }]);
