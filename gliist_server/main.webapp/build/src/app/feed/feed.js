angular.module('agora')
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider.state('feed', {
            url: '/feed',
            templateUrl: 'feed/templates/news.tpl.html',
            controller: 'newsCtrl',
            data: { pageTitle: 'Smart Feed' }
        });

        $stateProvider.state('around-me', {
            url: '/around-me',
            templateUrl: 'feed/templates/around-me.tpl.html',
            controller: 'aroundMeCtrl',
            data: { pageTitle: 'Around Me' }
        });

        $stateProvider.state('interests-result', {
            url: '/interests-result?searchQuery',
            templateUrl: 'feed/templates/interests-results.tpl.html',
            controller: 'interestsResultCtrl',
            data: { pageTitle: 'Search Results' }
        });
    })

;