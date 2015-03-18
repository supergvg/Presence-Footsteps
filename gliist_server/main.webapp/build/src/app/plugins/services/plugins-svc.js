
angular.module('agora')
    .service('pluginsService', ['$http', '$rootScope', '$q', '$window', 'appStateService', 'signalRService', '$location',
        function ($http, $rootScope, $q, $window, appStateService, signalRService, $location) {

            var openExternalLoginPopup = function (url) {
                var popupOptions = {
                    name: 'AuthPopup',
                    openParams: {
                        width: 650,
                        height: 300,
                        resizable: true,
                        scrollbars: true,
                        status: true
                    }
                },
                   formatPopupOptions = function (options) {
                       var pairs = [];
                       angular.forEach(options, function (value, key) {
                           if (value || value === 0) {
                               value = value === true ? 'yes' : value;
                               pairs.push(key + '=' + value);
                           }
                       });
                       return pairs.join(',');
                   },
                   popup = $window.open(url, popupOptions.name,
                                formatPopupOptions(popupOptions.openParams));
            };
            var loginFunctions = {
                facebook: function (user) {
                    signalRService.getClientId().then(function (clientId) {
                        openExternalLoginPopup('http://agora-west-us.azurewebsites.net/home/index.html#/plugin-login/facebook/' + clientId);
                    });
                },
                instagram: function () {
                    signalRService.getClientId().then(function (clientId) {
                        openExternalLoginPopup('http://agora-west-us.azurewebsites.net/home/index.html#/plugin-login/instagram/' + clientId);
                    });
                }
            };

            var onGetFeed = function (res, deferred) {
                angular.forEach(res.errors, function (error) {
                    $rootScope.alerts.push({ msg: error, type: 'danger' });
                });

                deferred.resolve(res);
            };

            var onGetFeedError = function (error, deferred) {
                if (error.errorCode == "401") {
                    return loginFunctions[error.pluginName]($rootScope.currentUser);
                }

                deferred.reject(error);
            };

            var that = {};

            that.login = function (pluginName) {
                return loginFunctions[pluginName]($rootScope.currentUser);
            };

            var plugins = [{ name: 'bitbucket' },
                        { name: 'dropbox' },
                        { name: 'facebook', displayName: 'Facebook' },
                        { name: 'flickr' },
                        { name: 'github' },
                        { name: 'google-plus' },
                        { name: 'instagram', displayName: 'Instagram' },
                        { name: 'linkedin' },
                        { name: 'pinterest' },
                        { name: 'tumblr' },
                        { name: 'twitter' },
                        { name: 'vk' }];

            that.getAvailablePlugins = function () {
                return [
                    { name: 'facebook', displayName: 'Facebook' },
                    { name: 'instagram', displayName: 'Instagram' }
                ]; //should call to server to get this list...
            };

            that.getProfile = function (social_id, pluginName) {
                var deferred = $q.defer();

                var url = '/api/plugins/GetProfile/';

                $http({
                    method: 'GET',
                    url: url,
                    params: {
                        'social_id': social_id,
                        'pluginName': pluginName
                    }
                }).
              success(function (data) {
                  deferred.resolve(data);
              }).
              error(function (err) {
                  deferred.reject(err);
              });

                return deferred.promise;
            };

            that.getUserFeed = function (feedOptions) {
                var deferred = $q.defer();

                var pagination;
                var url = '/api/plugins/GetFeed/';

                if (feedOptions) {
                    pagination = feedOptions.pagination;
                    url = '/api/plugins/FeedByPage/';
                }

                $http({
                    method: 'GET',
                    url: url,
                    params: {
                        'pagination': pagination
                    }
                }).
              success(function (data) {
                  onGetFeed(data, deferred);
              }).
              error(function (err) {
                  onGetFeedError(err, deferred);
              });

                return deferred.promise;
            };

            that.getPersonFeed = function (person) {
                var deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: '/api/plugins/GetPersonFeed/',
                    params: { 'personId': person.livingObjectId }
                }).
              success(function (data) {
                  onGetFeed(data, deferred);
              }).
              error(function (err) {
                  onGetFeedError(err, deferred);
              });

                return deferred.promise;
            };

            that.getProfileFeed = function (profileId, source) {
                var deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: '/api/plugins/GetProfileFeed/',
                    params: { 'source': source, 'profileId': profileId }
                }).
              success(function (data) {
                  onGetFeed(data, deferred);
              }).
              error(function (err) {
                  onGetFeedError(err, deferred);
              });

                return deferred.promise;
            };

            that.getPersonPictures = function (person, pagination) {
                var deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: '/api/plugins/GetPersonPhotos/',
                    params: {
                        'personId': person.livingObjectId,
                        'pagination': pagination
                    }
                }).
              success(function (data) {
                  onGetFeed(data, deferred);
              }).
              error(function (err) {
                  onGetFeedError(err, deferred);
              });

                return deferred.promise;
            };

            that.search = function (queryString, plugins) {
                var deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: '/api/plugins/GlobalSearch/',
                    params: {
                        'queryString': queryString,
                        'plugins': plugins ? plugins : ''
                    }
                }).
              success(function (data) {
                  onGetFeed(data, deferred);
              }).
              error(function (err) {
                  onGetFeedError(err, deferred);

              });

                return deferred.promise;
            };

            that.registerPlugin = function (pluginData) {
                var deferred = $q.defer();

                if (!pluginData.pluginUserId) {
                    deferre.reject('Invalid userId - undefined');
                }

                $http({
                    method: 'PUT',
                    url: '/api/plugins/RegisterPlugin/',
                    params: { 'userId': pluginData.pluginUserId },
                    data: pluginData
                }).
              success(function (data) {

                  if (!appStateService.getUser().plugins) {
                      appStateService.getUser().plugins = [];
                  }

                  appStateService.getUser().plugins.push(pluginData);
                  deferred.resolve(data);
              }).
              error(function (data) {
                  deferred.reject(data);
              });

                return deferred.promise;
            };

            return that;
        }]);