angular.module('agora')
    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider.state('people', {
            url: '/people',
            templateUrl: 'people/templates/people.tpl.html',
            controller: 'peopleCtrl',
            data: { pageTitle: 'People' }
        });

        $stateProvider.state('personPage', {
            url: '/person?personData',
            templateUrl: 'people/templates/person-dialog.tpl.html',
            controller: 'personCtrl',
            data: { pageTitle: 'Agora {{person.firstName}}' }
        });
    })

;