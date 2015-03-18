
angular.module('agora')
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider.state('plugin-dashboard', {
            url: '/plugin-dashboard',
            templateUrl: 'plugins/templates/plugin-dashboard.tpl.html',
            controller: 'pluginDashboardController',
            data: { pageTitle: 'Plugins control panel' }
        });

        $stateProvider.state('plugin-login', {
            url: '/plugin-login/:pluginName/:callerId',
            controller: 'pluginLoginCtrl',
            templateUrl: 'plugins/templates/plugin-login.tpl.html',
            access: {
                allowAnonymous: true
            },
            data: { pageTitle: 'Login to {{pluginData.name}}' }
        });

        $stateProvider.state('plugin-login-completed', {
            url: '/plugin-login/:pluginName/:userId/:pluginUserId/:pluginAccessToken/:access_token/:userName/:callerId',
            controller: 'pluginLoginCtrl',
            templateUrl: 'plugins/templates/plugin-login.tpl.html',
            access: {
                allowAnonymous: true
            },
            data: { pageTitle: 'Login to {{pluginData.name}}' }
        });

        $stateProvider.state('plugin-registration-completed', {
            url: '/plugin-registration/:pluginName/:userId/:pluginUserId/:pluginAccessToken/:callerId',
            controller: 'pluginLoginCtrl',
            templateUrl: 'plugins/templates/plugin-login.tpl.html',
            access: {
                allowAnonymous: true
            },
            data: { pageTitle: 'Login to {{pluginData.name}}' }
        });
    })

;