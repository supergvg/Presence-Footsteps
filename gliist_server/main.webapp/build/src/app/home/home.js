angular.module('agora')
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider.state('welcome', {
            url: '/welcome',
            templateUrl: 'home/templates/welcome.tpl.html',
            controller: 'welcomeCtrl',
            access: {
                allowAnonymous: true
            },
            data: { pageTitle: 'Welcome to Agora!' }
        });

        $stateProvider.state('signup', {
            url: '/signup',
            templateUrl: 'home/templates/signup.tpl.html',
            controller: 'signupCtrl',
            access: {
                allowAnonymous: true
            },
            data: { pageTitle: 'Signup with Email' }
        });

        $stateProvider.state('about', {
            url: '/about',
            templateUrl: 'home/templates/about.tpl.html',
            access: {
                allowAnonymous: true
            },
            data: { pageTitle: 'About Agora' }
        });
    })

;