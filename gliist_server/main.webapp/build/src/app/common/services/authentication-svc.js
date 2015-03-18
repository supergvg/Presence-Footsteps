
///https://github.com/mrgamer/angular-login-example/tree/master/src
angular.module('agora.services')
    .service('authenticationService', ['$http', '$q', '$cookieStore', 'appStateService', '$rootScope',
        function ($http, $q, $cookieStore, appStateService, $rootScope) {
            'use strict';
            var userEmail,
             isLogged,
             access_token,

             onLoginSuccessful = function (data) {

                 if (!data.access_token) {
                     throw new Exception('Trying to save empty acces token');
                 }

                 // successful login
                 isLogged = true;
                 userEmail = data.userName;
                 setAuthToken(data.access_token);

                 $cookieStore.put('userEmail', userEmail);
                 $cookieStore.put('access_token', data.access_token);
             },

             setAuthToken = function (token) {
                 access_token = token;
                 $http.defaults.headers.common.Authorization = 'Bearer ' + getAuthToken();
             },
             getAuthToken = function () {

                 if (!access_token) {
                     setAuthToken($cookieStore.get('access_token'));
                 }

                 return access_token;
             };


            $rootScope.$on("pluginAuthenticated", function (e, pluginName, profileId, data) {

                if (data) {
                    onLoginSuccessful(data);
                }

                $rootScope.$emit("loginGranted", pluginName, profileId);
            });


            var sdo = {

                getLogged: function () {

                    if (isLogged) {
                        return true;
                    }

                    if (sdo.getUserEmail() && getAuthToken()) {
                        return true;
                    }

                    return isLogged;
                },

                getUserEmail: function () {
                    if (!userEmail) {
                        userEmail = $cookieStore.get('userEmail');
                    }

                    return userEmail;
                },

                getCurrentUser: function () {

                    var deferred = $q.defer();
                    var url = '/api/Account/GetCurrentUser';

                    $http({
                        method: 'GET',
                        url: url,
                        params: {
                        },
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                        .success(function (data, status, headers) {

                            var userData = data;

                            appStateService.setUser(userData);

                            deferred.resolve(userData);

                        }).error(function (data, status, headers) {
                            deferred.reject(data);
                        });

                    return deferred.promise;
                },

                login: function (credentials) {
                    var deferred = $q.defer();
                    var body = 'grant_type=password&username=' + credentials.email + '&password=' + credentials.password;

                    var url = '/Token';

                    $http({
                        method: 'POST',
                        url: url,
                        data: body,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                        .success(function (data, status, headers) {
                            if (status === 200) {
                                onLoginSuccessful(data);

                                deferred.resolve(data);
                            } else {
                                isLogged = false;
                                userEmail = '';
                                deferred.resolve(data);
                            }
                        })
                        .error(function (data, status, headers) {
                            isLogged = false;
                            userEmail = '';

                            deferred.reject(data);
                        });

                    return deferred.promise;
                },

                logout: function () {

                    isLogged = false;
                    userEmail = '';
                    setAuthToken('');

                    $cookieStore.remove('userEmail');
                    $cookieStore.remove('access_token');

                    appStateService.setUser(null);
                },

                registerEmail: function (user) {
                    var deferred = $q.defer();

                    var url = '/api/Account/Register';

                    $http({
                        method: 'POST',
                        url: url,
                        data: user,
                        headers: { 'Content-Type': 'application/json' }
                    })
                        .success(function (data, status, headers) {
                            if (status === 200) {
                                sdo.login(user, deferred).then(function (data) {
                                    deferred.resolve(data);
                                }, function (error) {
                                    deferred.reject(error);
                                });
                            } else {
                                isLogged = false;
                                userEmail = '';
                                deferred.reject(data.modelState);
                            }
                        })
                        .error(function (data, status, headers) {
                            isLogged = false;
                            userEmail = '';

                            deferred.reject(data.modelState);
                        });

                    return deferred.promise;
                }
            };

            return sdo;
        }]);