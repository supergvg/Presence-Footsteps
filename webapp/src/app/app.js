'use strict';

angular.module('gliist')
    .controller('AppController', ['$scope', function ($scope) {


        $scope.menuItems = [
            {
                title: 'Create Event',
                ui_sref: 'main.create_event',
                icon: {name: 'add_circle', style: "fill: #abcdef", size: 24 }
            },
            {
                title: 'Current Events',
                ui_sref: 'main.current_events',
                icon: {name: 'today', style: "fill: #abcdef", size: 24}
            },
            {
                title: 'Past Event',
                ui_sref: 'main.past_events',
                icon: {name: 'history', style: "fill: #abcdef", size: 24 }
            },
            {
                title: 'Guest List Management',
                ui_sref: 'main.list_management',
                icon: {name: 'content_paste', style: "fill: #abcdef", size: 24}
            },
            {
                title: 'Profile',
                ui_sref: 'main.user',
                icon: {name: 'assignment_ind', style: "fill: #abcdef", size: 24}
            }
        ];
    }]);
