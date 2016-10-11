'use strict';

function AppController (
  $scope,
  $rootScope,
  $state,
  $mdSidenav,
  $mdMedia,
  $mdDialog,
  userService,
  dialogService,
  permissionsService,
  subscriptionsService,
  facebookService
) {
  $scope.credentials = {};
  $scope.hidePhoto = false;
  $scope.menuItems = [
    {
      title: 'Create Event',
      ui_sref: 'main.create_event',
      icon: {src: 'assets/images/icons/create_event.png'}
    },
    {
      title: 'Facebook Event Integration',
      icon: {src: 'assets/images/icons/facebook_solid.png'}
    },
    {
      title: 'Upcoming Events',
      ui_sref: 'main.current_events',
      icon: {src: 'assets/images/icons/upcoming_events.png'}
    },
    {
      title: 'Guest List Management',
      ui_sref: 'main.list_management',
      icon: {src: 'assets/images/icons/guest_list_management.png'}
    },
    {
      title: 'Past Events',
      ui_sref: 'main.stats',
      icon: {src: 'assets/images/icons/event_stats.png'}
    },
    {
      title: 'User Profile',
      ui_sref: 'main.user',
      icon: {src: 'assets/images/icons/user_profile.png'}
    }
  ];

  $rootScope.$watch('currentUser', function(newValue) {
    $scope.currentUser = newValue;
    $scope.getUserPhoto();
  });

  $rootScope.$on('userUpdated', function () {
    $scope.userProfilePic = userService.getUserPhoto(null, $scope.currentUser);
  });

  $scope.getMenuItems = function() {
    if (permissionsService.isRole('promoter')) {
      return [$scope.menuItems[1], $scope.menuItems[2], $scope.menuItems[3], $scope.menuItems[4]];
    } else if (permissionsService.isRole('staff')) {
      return [$scope.menuItems[1], $scope.menuItems[3], $scope.menuItems[4]];
    }
    return $scope.menuItems;
  };

  $scope.getUserPhoto = function(height) {
    $scope.userProfilePic = userService.getUserPhoto(height, $scope.currentUser);
  };

  $scope.toggleSidebar = function() {
    $mdSidenav('left').toggle();
  };

  $scope.setSelected = function (item) {
    if ((item.title === 'Guest List Management' && !subscriptionsService.verifyFeature('GLM', 0, true)) ||
      (item.title === 'Create Event' && !permissionsService.isRole('admin') && !subscriptionsService.verifyFeature('EventContributors', 0, true))) { //admin always can create events
      return;
    }

    if (item.title === 'Facebook Event Integration') {
      $scope.showFacebookEvents();
      return;
    }

    $scope.selectedMenuItem = item;
    if (!$mdMedia('gt-lg')) {
      $mdSidenav('left').close();
    }
    $state.go(item.ui_sref);
  };

  $scope.getItemClass = function(item) {
    if (item === $scope.selectedMenuItem) {
      return 'item-selected';
    }
  };

  $scope.getBg = function () {
    if ($state.current.abstract || $state.includes('home') ||
      $state.includes('signup') || $state.includes('signup_invite') ||
      $state.includes('recover_password') || $state.includes('reset_password')) {
      return 'logo-bg ' + $state.current.name;
    }
    if ($state.current.name.match(/^landing_.+/)) {
      return $state.current.name.split('_');
    }
    if ($state.current.name === 'choose_plan') {
      return 'choose_plan';
    }
  };

  $scope.showUserBars = function(){
    if ($state.current.name.match(/^landing_.+/) || $state.current.name === 'choose_plan') {
      return false;
    }
    return $rootScope.currentUser;
  };

  $scope.loginSuccesful = function () {
    $state.go('main.welcome');
  };

  $scope.loginFailed = function (response) {
    var message = (response && response.status !== 500 && response.data.error_description) || 'Something went wrong. Try again later please.';
    dialogService.error(message);
  };

  $scope.login = function() {
    if (!$scope.credentials.username || !$scope.credentials.password) {
      return;
    }
    $scope.fetchingData = true;
    userService.login($scope.credentials).then($scope.loginSuccesful, $scope.loginFailed).finally(function() {
      $scope.fetchingData = false;
    });
  };

  $scope.facebookSignIn = function () {
    facebookService.login().then(function (fbResponse) {
      var token = fbResponse.authResponse.accessToken;

      userService.login({facebook_token: token}).then($scope.loginSuccesful, $scope.loginFailed).finally(function() {
        $scope.fetchingData = false;
      });
    });
  };

  $scope.facebookSignUp = function () {
    facebookService.login().then(function (response) {
      var token = response.authResponse.accessToken;
      facebookService.getUserData().then(function (data) {
        userService.setUserData({
          FacebookToken: token,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.email
        });
        $state.go('signup');
      });
    });
  };

  $scope.showFacebookEvents = function () {
    var scope = $scope.$new();
    $mdDialog.show({
      scope: scope,
      controller: 'FacebookEventsController',
      templateUrl: 'app/templates/facebook-events-popup.html'
    });
  };

  $rootScope.logout = function() {
    userService.logout();
    $state.go('home');
  };

  $scope.onEnterPress = function(event) {
    if (event.which === 13 && $scope.credentials.username && $scope.credentials.password) {
      $scope.login();
    }
  };
}

AppController.$inject = [
  '$scope',
  '$rootScope',
  '$state',
  '$mdSidenav',
  '$mdMedia',
  '$mdDialog',
  'userService',
  'dialogService',
  'permissionsService',
  'subscriptionsService',
  'facebookService'
];

angular.module('gliist').controller('AppController', AppController);
