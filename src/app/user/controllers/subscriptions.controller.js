'use strict';

function SubscriptionsCtrl (
  $scope,
  $rootScope,
  $state,
  $filter,
  subscriptionsService,
  dialogService
) {
  $scope.plans = [];
  $scope.pricePolicyKeys = [];
  $scope.options = $scope.options || {};
  $scope.planLabels = [];

            $scope.isPricePolicyVisible = function (plan, pricePolicy) {
                if (!$scope.isSubscribed() || $scope.subscriptionIsExpired()) {
                    return true;
                }
                var userSubscription = $rootScope.currentUser.subscription;
                if (userSubscription.subscription.id === plan.id && userSubscription.pricePolicy.type === 'Promo') { //hide standard policies of same type
                    //for future releases: hide options covered by current price policy
                    var userpp = userSubscription.pricePolicy;
                    var userPriceTypes = [];
                    var i, pc;
                    for (i = 0, pc = userpp.prices.length; i < pc; i++) { //collect all price types for user's price policy
                        userPriceTypes.push(userpp.prices[i].type);
                    }
                    for (i = 0, pc = pricePolicy.prices.length; i < pc; i++) {
                        if (userPriceTypes.indexOf(pricePolicy.prices[i].type) !== -1) {
                            return false;
                        }
                    }
                }
                return userSubscription.pricePolicy.id !== pricePolicy.id;
            };

  $scope.subscriptionIsExpired = function () {
    if (!$rootScope.currentUser || !$rootScope.currentUser.subscription) {
      return true;
    }
    var s = $rootScope.currentUser.subscription;
    return new Date(s.endDate) < new Date() && (s.status === 'Canceled' || s.pricePolicy.type === 'Promo');
  };
  $scope.subscriptionHasPromo = function (plan) {
    if (!$rootScope.currentUser || !$rootScope.currentUser.subscription) {
      return false;
    }
    var s = $rootScope.currentUser.subscription;
    return s.subscription.id === plan.id && s.pricePolicy.type === 'Promo';
  };

  $scope.allowToSelect = function(index) {
    return $scope.plans[index].pricePolicies.length > 0;
  };

  $scope.showButton = function(index) {
    if ($scope.getLabelForButton($scope.plans[index]) != 'UPGRADE') {
      for (var i = 0, pc = $scope.plans.length; i < pc; i++) {//hide downgrade if subscription is transforming
        if ($scope.plans[i].isTransform) {
          return false;
        }
      }
    }
    if (!$scope.allowToSelect(index)) {//if has options
      return false;
    }
    if (!$scope.isSubscribed() || $scope.subscriptionIsExpired()) {//only on choose plan page
      return true;
    }
    if ($scope.subscriptionHasPromo($scope.plans[index])) {//hide button for promo
      return false;
    }
    var subscriptionStatus = '',
      pricePolicyType = '',
      isPAYG = false;
    if ($scope.isSubscribed()) {
      subscriptionStatus = $rootScope.currentUser.subscription.status;
      pricePolicyType = $rootScope.currentUser.subscription.pricePolicy.prices[0].type;
      isPAYG = $rootScope.currentUser.subscription.subscription.name === 'Pay as you go';
    }
    var isMoreOnePrice = !$scope.plans[index].isCurrentlyUsed || ($scope.plans[index].isCurrentlyUsed && $scope.plans[index].pricePolicies.length > 1 && pricePolicyType !== 'Year'),
      isPlanTransform = subscriptionStatus === 'Active' || (subscriptionStatus !== 'Active' && $scope.getLabelForButton($scope.plans[index]) !== 'DOWNGRADE');
    return isMoreOnePrice && isPlanTransform && !(isPAYG && $scope.plans[index].name === 'Basic');
  };

  $scope.getStatus = function () {
    var isExpired = $scope.subscriptionIsExpired();
    var status = isExpired ? 'INACTIVE' : 'ACTIVE';
    var endDate = $scope.getEndDate();
    if (endDate) {
      status += ': ' + (isExpired ? 'expired' : 'expires') + ' on ' + $filter('date')(endDate, 'MM/dd/yyyy');
    }
    return status;
  };

  $scope.getEndDate = function() {
    if ($scope.isSubscribed()) {
      return $rootScope.currentUser.subscription.endDate;
    }
    return false;
  };

  $scope.isSubscribed = function() {
    return $rootScope.currentUser && $rootScope.currentUser.subscription && $rootScope.currentUser.subscription !== 'undefined';
  };

  $scope.beforeSelectPlan = function(index, event) {
    var planLabel = $scope.getLabelForButton($scope.plans[index]);
    if (planLabel === 'UPGRADE' && $scope.plans[index].name !== 'Pay as you go') {
      dialogService.confirm(event, 'You are about to upgrade.<br>If there is a prorated amount, you will receive an email', 'UPGRADE', 'CANCEL').then(function(){
        $scope.selectPlan(index);
      });
    } else if (planLabel === 'DOWNGRADE' && $scope.plans[index].name !== 'Basic') {
      var message = 'Are you sure you want to downgrade?<br>Your new plan will be in effect the next billing cycle';
      if ($scope.isSubscribed() && $rootScope.currentUser.subscription.subscription.name === 'Monthly' && $scope.plans[index].name === 'Guest List Only') {
        message = 'Are you sure you want to downgrade?<br>Your premium features will not be accessible after';
      }
      dialogService.confirm(event, message, 'YES', 'NO').then(function(){
        $scope.selectPlan(index);
      });
    } else {
      $scope.selectPlan(index);
    }
  };

  $scope.selectPlan = function(index) {
    var selectedPlan = $scope.plans[index],
      pricePolicyKey = $scope.pricePolicyKeys[index],
      pricePolicy = selectedPlan.pricePolicies[pricePolicyKey];

    if ((pricePolicy.prices[0].amount > 0 || selectedPlan.usedPromoCode) && selectedPlan.name !== 'Pay as you go') {
      subscriptionsService.paymentPopup(selectedPlan, pricePolicyKey, $scope.getSubscriptions);
    } else {
      $scope.loading = true;
      subscriptionsService.setUserSubscription({
        subscriptionId: selectedPlan.id,
        pricePolicyId: pricePolicy.id
      }).then(
        function(response){
          $rootScope.currentUser.subscription = response.data;
          if ($state.current.name === 'choose_plan') {
            if ($rootScope.currentUser.subscription.subscription.name === 'Pay as you go') {
              dialogService.confirm(null, 'Payment is not required now until you create an event.', 'Ok').then(function(){
                $state.go('main.welcome');
              });
            } else {
              $state.go('main.welcome');
            }
          } else {
            $scope.getSubscriptions();
          }
        },
        function(rejection){
          dialogService.confirm(null, rejection.data.message, 'OK', '');
        }
      ).finally(function(){
        $scope.loading = false;
      });
    }
  };

  $scope.getLabelForButton = function (plan) {
    if (!$scope.isSubscribed() || $scope.subscriptionIsExpired()) {
      return 'SELECT';
    }
    var sid = $rootScope.currentUser.subscription.subscription.id;
    if (plan.id >= sid) {
      return 'UPGRADE';
    }
    return 'DOWNGRADE';
  };

  $scope.getSubscriptions = function() {
    $scope.loading = true;
    subscriptionsService.getSubscriptions().then(
      function(data) {
        $scope.plans = data.data;
        var label = 'DOWNGRADE';
        if (!$scope.isSubscribed()) {
          label = 'SELECT';
        }
        $scope.planLabels = [];
        $scope.pricePolicyKeys = [];
        angular.forEach($scope.plans, function(plan, key){
          $scope.pricePolicyKeys[key] = 0;
          if (plan.isCurrentlyUsed && ($scope.isSubscribed() && !$scope.subscriptionIsExpired())) {
            if ($scope.isSubscribed()) {
              angular.forEach(plan.pricePolicies, function(pricePolicy, index){
                if (pricePolicy.id !== $rootScope.currentUser.subscription.pricePolicy.id) {
                  $scope.pricePolicyKeys[key] = index;
                }
              });
            }
            if (plan.pricePolicies.length === 1) {
              $scope.planLabels.push('ACTIVE');
            }
            label = 'UPGRADE';
          } else {
            $scope.planLabels.push(label);
          }
        });
      }
    ).finally(function(){
      $scope.loading = false;
    });
  };
  $scope.getSubscriptions();
}

SubscriptionsCtrl.$inject = [
  '$scope',
  '$rootScope',
  '$state',
  '$filter',
  'subscriptionsService',
  'dialogService'
];

angular.module('gliist').controller('SubscriptionsCtrl', SubscriptionsCtrl);
