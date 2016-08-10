'use strict';

angular.module('gliist').service('permissionsService', ['$rootScope',
    function ($rootScope) {
        this.roles = {
            admin: {
                label: 'Administrator',
                denyAccess: []
            },
            manager: {
                label: 'Manager',
                desc: 'Same access as Admin but cant add contributor',
                denyAccess: ['main.user?view=1', 'main.user?view=2']
            },
            staff: {
                label: 'Staff',
                desc: 'Allow to check guests in and check on event stats',
                denyAccess: ['main.create_event', 'main.list_management', 'main.edit_glist', 'main.create_list_management', 'main.user?view=1', 'main.user?view=2']
            },
            promoter: {
                label: 'Promoter',
                desc: 'Allow to add guests to the list he is assigned to',
                denyAccess: ['main.create_event', 'main.user']
            }
        };
        this.roleExisis = function() {
            return angular.isDefined(this.roles[$rootScope.currentUser.permissions]);
        };
        this.roleDenyAccess = function(stateName, stateParams) {
            return this.roles[$rootScope.currentUser.permissions].denyAccess.indexOf(stateName) > -1 || (stateParams.view && this.roles[$rootScope.currentUser.permissions].denyAccess.indexOf(stateName+'?view='+stateParams.view) > -1);
        };
        this.isRole = function(role) {
            return $rootScope.currentUser && $rootScope.currentUser.permissions.indexOf(role) > -1;            
        };
    }]);