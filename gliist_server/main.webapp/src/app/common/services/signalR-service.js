
angular.module('agora.services')
    .service('signalRService', ['$rootScope', '$q',
function ($rootScope, $q) {
    "use strict";
    var proxy, clientId, connection;

    var initialize = function () {
        //Getting the connection object
        this.connection = $.hubConnection();

        //Creating proxy
        this.proxy = this.connection.createHubProxy('notificationHub');

        //Starting connection
        var that = this;
        this.connection.start().done(function () {
            that.clientId = that.proxy.connection.id;
        });

        this.connection.start().done(function () {
            that.clientId = that.proxy.connection.id;
        });

        //Publishing an event when server pushes a greeting message
        this.proxy.on('notifyPluginRegistered', function (pluginName, profileId) {
            $rootScope.$emit("pluginRegistered", pluginName, profileId);
        });

        //Publishing an event when server pushes a greeting message
        this.proxy.on('notifyPluginAuthenticated', function (pluginName, profileId) {
            $rootScope.$emit("pluginAuthenticated", pluginName, profileId);
        });

    };

    return {
        initialize: initialize,

        getClientId: function () {
            var deferred = $q.defer();

            var that = this;
            this.connection.start().done(function () {

                if (!that.clientId) {
                    throw new Exception("singalR connection not initalized");
                }

                deferred.resolve(that.clientId);

            });
            return deferred.promise;
        },

        notifyPluginAuthenticated: function (pluginName, socialProfileId, callerId) {
            var deferred = $q.defer();
            var that = this;
            this.connection.start().done(function () {
                //Invoking send method defined in hub - here as an example
                that.proxy.invoke('notifyPluginAuthenticated', pluginName, socialProfileId, callerId);
                deferred.resolve();
            });

            return deferred.promise;
        },

        notifyPluginRegistered: function (pluginName, socialProfileId, callerId) {
            var deferred = $q.defer();
            var that = this;
            this.connection.start().done(function () {
                //Invoking send method defined in hub - here as an example
                that.proxy.invoke('notifyPluginRegistered', pluginName, socialProfileId, callerId);
                deferred.resolve();
            });

            return deferred.promise;
        }
    };
}]);
