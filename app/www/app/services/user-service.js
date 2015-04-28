angular.module('starter').factory('userService', [ '$rootScope', '$http', '$q',

    function ($rootScope, $http, $q) {
        'use strict';
        var userEmail,
            isLogged,
            access_token,
            userData,

            onLoginSuccessful = function (data) {

                if (!data.access_token) {
                    throw new Exception('Trying to save empty acces token');
                }

                // successful login
                isLogged = true;
                userEmail = data.userName;
                setAuthToken(data.access_token);

                window.localStorage['userEmail'] = userEmail;
                window.localStorage['access_token'] = data.access_token;
            },

            setAuthToken = function (token) {
                access_token = token;
                $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            },
            getAuthToken = function () {

                if (!access_token) {
                    setAuthToken(window.localStorage['access_token']);
                }

                return access_token;
            };

        return  {

            getUserPhoto: function (height, currentUser, suffix) {
                var bgImg,
                    redirectUrl = "http://gliist.azurewebsites.net/";

                if (currentUser) {
                    bgImg = redirectUrl + "/api/account/ProfilePicture/?userId=" + currentUser.userId + "&suffix=" + suffix;
                    bgImg = "url(" + bgImg + ")";
                } else {
                    bgImg = "url('assets/images/blank_user_icon.png')";
                }

                return {
                    'background-image': bgImg,
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-size': 'cover'
                };
            },


            getCurrentUser: function () {

                var deferred = $q.defer(),
                    url = 'api/Account/UserInfo',
                    self = this;

                if (userData) {
                    deferred.resolve(userData);
                }

                $http({
                    method: 'GET',
                    url: url,
                    params: {
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    .success(function (data) {

                        self.userData = data;
                        deferred.resolve(self.userData);

                    }).error(function (data) {
                        deferred.reject(data);
                    });

                return deferred.promise;
            },

            getLogged: function () {

                if (isLogged) {
                    return true;
                }

                if (window.localStorage['userEmail'] && getAuthToken()) {
                    return true;
                }

                return isLogged;
            },

            login: function (credentials) {

                var d = $q.defer();
                var body = 'grant_type=password&username=' + credentials.username + '&password=' + credentials.password;

                $http({
                    method: "POST",
                    url: "/Token",
                    data: body,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data, status) {

                    if (status === 200) {
                        onLoginSuccessful(data);

                        d.resolve(data);
                    } else {
                        isLogged = false;
                        userEmail = '';
                        d.resolve(data);
                    }

                    d.resolve(data);
                }).error(function (data) {
                    d.reject(data);
                });


                return d.promise;
            },

            logout: function () {

                isLogged = false;
                userEmail = '';
                setAuthToken('');

                delete window.localStorage['userEmail'];
                delete window.localStorage['access_token'];
            },

            registerEmail: function (user) {
                var deferred = $q.defer();

                var url = '/api/Account/Register';

                var that = this;
                $http({
                    method: 'POST',
                    url: url,
                    data: user,
                    headers: { 'Content-Type': 'application/json' }
                })
                    .success(function (data, status) {
                        if (status === 200) {
                            that.login(user, deferred).then(function (data) {
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
                    .error(function (data) {
                        isLogged = false;
                        userEmail = '';

                        deferred.reject(data.ModelState);
                    });

                return deferred.promise;
            }
        }
    }
]);
