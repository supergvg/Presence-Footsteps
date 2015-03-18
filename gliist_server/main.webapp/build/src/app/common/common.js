angular.module('agora')
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider.state('user-profile', {
            url: '/user-profile',
            templateUrl: 'common/templates/user-profile.tpl.html',
            controller: 'userProfileCtrl',
                    
            data: { pageTitle: 'User control panel' }
        });
    })

;