'use strict';

angular.module('gliist')
    .controller('SubscriptionsCtrl', ['$scope', 'subscriptionsService',
        function($scope, subscriptionsService) {
            $scope.loading = true;
            $scope.plans = [];
            
$scope.plans=            [
    {
        "id": 1,
        "keyForUI": "basic",
        "name": "Basic",
        "descriptionLine1": "Use gjests for free! ",
        "descriptionLine2": "For any type of events",
        "priceDetails": "FREE",
        "subscriptionValidityInMonths": 12,
        "displaySequence": 1,
        "feature": [
          {
            "SubscriptionFeature": {
              "name": "Up to 50 guest check-in"
            },
            "DisplaySequence": 1
          },
          {
            "SubscriptionFeature": {
              "name": "2 devices"
            },
            "DisplaySequence": 2
          },
          {
            "SubscriptionFeature": {
              "name": "2 accounts"
            },
            "DisplaySequence": 3
          },
          {
            "SubscriptionFeature": {
              "name": "Event report"
            },
            "DisplaySequence": 4
          },
          {
            "SubscriptionFeature": {
              "name": "No Support"
            },
            "DisplaySequence": 5
          }
        ],
    },
    {
        "id": 2,
        "keyForUI": "ticketing",
        "name": "Ticketing",
        "descriptionLine1": "Use gjests for any ticketing events with low fees",
        "descriptionLine2": "",
        "priceDetails": "$1/Ticket plus 2.9% +$.30/transaction",
        "subscriptionValidityInMonths": 12,
        "displaySequence": 2,
       "feature": [
          {
            "SubscriptionFeature": {
              "name": "Unlimited guest check-ins"
            },
            "DisplaySequence": 1
          },
          {
            "SubscriptionFeature": {
              "name": "5 devices used at once"
            },
            "DisplaySequence": 2
          },
          {
            "SubscriptionFeature": {
              "name": "10 accounts"
            },
            "DisplaySequence": 3
          },
          {
            "SubscriptionFeature": {
              "name": "Event report"
            },
            "DisplaySequence": 4
          },
          {
            "SubscriptionFeature": {
              "name": "Offline mode"
            },
            "DisplaySequence": 5
          },
          {
            "SubscriptionFeature": {
              "name": "Support"
            },
            "DisplaySequence": 6
          },
          {
            "SubscriptionFeature": {
              "name": "*Guest list feature only available when the event is selling over 100 tickets"
            },
            "DisplaySequence": 7
          }
        ],
    },
    {
       "id": 3,
        "keyForUI": "payasyougo",
        "name": "Pay As You Go",
        "descriptionLine1": "No Commitment. ",
        "descriptionLine2": "Perfect for hosting events occasionally",
        "priceDetails": "$59/event",
        "subscriptionValidityInMonths": 0,
        "displaySequence": 3,
        "feature": [
          {
            "SubscriptionFeature": {
              "name": "Unlimited email invites"
            },
            "DisplaySequence": 2
          },
          {
            "SubscriptionFeature": {
              "name": "Unlimited accounts"
            },
            "DisplaySequence": 3
          },
          {
            "SubscriptionFeature": {
              "name": "Guest list feature"
            },
            "DisplaySequence": 5
          },
          {
            "SubscriptionFeature": {
              "name": "RSVP feature"
            },
            "DisplaySequence": 6
          },
          {
            "SubscriptionFeature": {
              "name": "Ticketing feature"
            },
            "DisplaySequence": 7
          },
          {
            "SubscriptionFeature": {
              "name": "Promoter contributor access"
            },
            "DisplaySequence": 8
          },
          {
            "SubscriptionFeature": {
              "name": "5 devices used at once"
            },
            "DisplaySequence": 4
          },
          {
            "SubscriptionFeature": {
              "name": "Unlimited guest check-ins"
            },
            "DisplaySequence": 1
          },
          {
            "SubscriptionFeature": {
              "name": "Event report"
            },
            "DisplaySequence": 9
          },
          {
            "SubscriptionFeature": {
              "name": "Offline mode"
            },
            "DisplaySequence": 10
          },
          {
            "SubscriptionFeature": {
              "name": "No Support"
            },
            "DisplaySequence": 11
          }
        ],
    },
    {
        "feature": [
          {
            "SubscriptionFeature": {
              "name": "Monthly: Same service as Pay As You Go"
            },
            "DisplaySequence": 1
          },
          {
            "SubscriptionFeature": {
              "name": "Annual: Get one month free when you pay upfront"
            },
            "DisplaySequence": 3
          },
          {
            "SubscriptionFeature": {
              "name": "Support"
            },
            "DisplaySequence": 2
          }
        ],
        "id": 4,
        "keyForUI": "monthly",
        "name": "Monthly",
        "descriptionLine1": "Perfect for professionals! ",
        "descriptionLine2": "Friendly pricing with extra features",
        "priceDetails": "$260/month No commitment",
        "subscriptionValidityInMonths": 1,
        "displaySequence": 4
      },
       {
        "feature": [
          {
            "SubscriptionFeature": {
              "name": "All gjests features"
            },
            "DisplaySequence": 1
          },
          {
            "SubscriptionFeature": {
              "name": "Dedicated account manager"
            },
            "DisplaySequence": 2
          },
          {
            "SubscriptionFeature": {
              "name": "Customized RSVP page"
            },
            "DisplaySequence": 3
          },
          {
            "SubscriptionFeature": {
              "name": "Support"
            },
            "DisplaySequence": 4
          }
        ],
        "id": 8,
        "keyForUI": "enterprise",
        "name": "Enterprise",
        "descriptionLine1": "For huge guest lists! ",
        "descriptionLine2": "Contact us and discuss more!",
        "priceDetails": null,
        "subscriptionValidityInMonths": 12,
        "displaySequence": 6
      },
      {
        "feature": [
          {
            "SubscriptionFeature": {
              "name": "Monthly: Same service as Pay As You Go"
            },
            "DisplaySequence": 1
          },
          {
            "SubscriptionFeature": {
              "name": "Annual: Get one month free when you pay upfront"
            },
            "DisplaySequence": 3
          },
          {
            "SubscriptionFeature": {
              "name": "Support"
            },
            "DisplaySequence": 2
          }
        ],
        "id": 9,
        "keyForUI": "annually",
        "name": "Annually",
        "descriptionLine1": "Perfect for professionals! ",
        "descriptionLine2": "Friendly pricing with extra features",
        "priceDetails": "$3000/annually",
        "subscriptionValidityInMonths": 12,
        "displaySequence": 5
      }
];
            
            
            
            subscriptionsService.getAllSubscriptions().then(
                function(data){
                    $scope.plans = data;
                }
            ).finally(function(){
               $scope.loading = false; 
            });
        }]);
