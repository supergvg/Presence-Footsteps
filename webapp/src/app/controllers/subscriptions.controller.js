'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService',
        function($scope, subscriptionsService) {
            $scope.loading = true;
            $scope.plans = [];
            subscriptionsService.getAllSubscriptions().then(
                function(data){
                    $scope.plans = data;
                    $scope.plans = [
  {
    "id": 1,
    "name": "Professional",
    "feature": [
      {
        "SubscriptionFeatureDetails": {
          "Id": 1,
          "Name": "100 guest check-in",
          "IsActive": true
        },
        "id": 1
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 4,
          "Name": "3 Devices",
          "IsActive": true
        },
        "id": 2
      }
    ],
    "amount": 59,
    "subscriptionDuration": "Monthly",
    "SubscriptionValidityInDays": 30
  },
  {
    "id": 2,
    "name": "Enterprise",
    "feature": [
      {
        "SubscriptionFeatureDetails": {
          "Id": 3,
          "Name": "Unlimted guest check-ins",
          "IsActive": true
        },
        "id": 3
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 6,
          "Name": "Unlimited Devices",
          "IsActive": true
        },
        "id": 10
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 7,
          "Name": "Promotor Contribution Account",
          "IsActive": true
        },
        "id": 12
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 8,
          "Name": "RSVP Features",
          "IsActive": true
        },
        "id": 14
      }
    ],
    "amount": 300,
    "subscriptionDuration": "Yearly",
    "SubscriptionValidityInDays": 365
  },
  {
    "id": 4,
    "name": "Premium",
    "feature": [
      {
        "SubscriptionFeatureDetails": {
          "Id": 2,
          "Name": "1000 guest check-ins",
          "IsActive": true
        },
        "id": 4
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 5,
          "Name": "5 Devices",
          "IsActive": true
        },
        "id": 9
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 7,
          "Name": "Promotor Contribution Account",
          "IsActive": true
        },
        "id": 11
      },
      {
        "SubscriptionFeatureDetails": {
          "Id": 8,
          "Name": "RSVP Features",
          "IsActive": true
        },
        "id": 13
      }
    ],
    "amount": 125,
    "subscriptionDuration": "Quarterly",
    "SubscriptionValidityInDays": 120
  }
];
                }
            ).finally(function(){
               $scope.loading = false; 
            });
        }]);
