'use strict';

angular.module('gliist').factory('userService', ['$rootScope', '$http', '$q', '$window',
    function ($rootScope, $http, $q, $window) {
        var userEmail,
            isLogged,
            access_token,
            userData,
            onLoginSuccessful = function(data) {
                if (!data.access_token) {
                    throw 'Trying to save empty access token';
                }
                // successful login
                isLogged = true;
                userEmail = data.userName;
                setAuthToken(data.access_token);

                $window.localStorage.setItem('userEmail', userEmail);
                $window.localStorage.setItem('access_token', data.access_token);
            },
            setAuthToken = function(token) {
                access_token = token;
                $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            },
            getAuthToken = function() {
                if (!access_token) {
                    setAuthToken($window.localStorage.getItem('access_token'));
                }
                return access_token;
            };

        return {
            resetPassword: function(resetPassword) {
                var deferred = $q.defer(),
                    url = 'api/Account/ResetPassword';
            
                $http({
                    method: 'POST',
                    url: url,
                    data: resetPassword
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });
                
                return deferred.promise;
            },
            
            changePassword: function(changePassword) {
                var deferred = $q.defer(),
                    url = 'api/Account/ChangePassword';

                $http({
                    method: 'POST',
                    url: url,
                    data: changePassword
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            sendPasswordRecover: function(userEmail) {
                var deferred = $q.defer(),
                    url = 'api/EmailController/SendRecoverPasswordEmail';

                $http({
                    method: 'POST',
                    url: url,
                    params: {
                        userEmail: userEmail
                    }
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            getInviteInfo: function(company, token) {
                var deferred = $q.defer(),
                    url = 'api/companies/GetInviteInfo';

                if (userData) {
                    deferred.resolve(userData);
                }
                $http({
                    method: 'GET',
                    url: url,
                    params: {
                        companyName: company,
                        token: token
                    }
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            getCompanyInfo: function() {
                var deferred = $q.defer(),
                    url = 'api/Account/CompanyInfo';

                if (userData) {
                    deferred.resolve(userData);
                }
                $http({
                    method: 'GET',
                    url: url
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            deleteUser: function(params) {
                var deferred = $q.defer(),
                    url = 'api/Account/DeleteRegisterByInvite';
            
                $http({
                    method: 'DELETE',
                    url: url,
                    params: params
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            sendJoinRequest: function(user) {
                var deferred = $q.defer(),
                    url = 'api/Account/InviteUser';

                if (userData) {
                    deferred.resolve(userData);
                }
                $http({
                    method: 'POST',
                    url: url,
                    data: user
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            updateCompanyUser: function(user) {
                var deferred = $q.defer(),
                    url = 'api/Account/UpdateCompanyUser';

                $http({
                    method: 'PUT',
                    url: url,
                    data: user
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            getUserPhoto: function(height, currentUser, suffix) {
                var bgImg;
                
                if (currentUser) {
                    bgImg = $window.redirectUrl + '/api/account/ProfilePicture/?userId=' + currentUser.userId + '&suffix=' + suffix;
                    bgImg = 'url(' + bgImg + ')';
                } else {
                    bgImg = 'url("assets/images/blank_user_icon.png")';
                }

                return {
                    'background-image': bgImg,
                    'background-position': 'center center',
                    'height': height || '250px',
                    'background-size': 'contain',
                    'background-repeat': 'no-repeat'
                };
            },
            
            updateUserProfile: function(user) {
                var deferred = $q.defer(),
                    url = 'api/Account/UserInfo';

                $http({
                    method: 'PUT',
                    url: url,
                    data: user
                }).success(function (data) {
                    deferred.resolve(data);

                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },

            getCurrentUser: function() {
                var deferred = $q.defer(),
                    url = 'api/Account/UserInfo',
                    self = this;

                if (userData) {
                    deferred.resolve(userData);
                }
                $http({
                    method: 'GET',
                    url: url,
                    params: {},
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    self.userData = data;
                    deferred.resolve(self.userData);

                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            getLogged: function() {
                if (isLogged) {
                    return true;
                }
                if ($window.localStorage.getItem('userEmail') && getAuthToken()) {
                    return true;
                }
                return isLogged;
            },
            
            login: function(credentials) {
                var d = $q.defer();
                var body = 'grant_type=password&username=' + credentials.username + '&password=' + credentials.password;

                $http({
                    method: 'POST',
                    url: '/Token',
                    data: body,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
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
            
            logout: function() {
                isLogged = false;
                userEmail = '';
                setAuthToken('');
                $rootScope.currentUser = null;

                $window.localStorage.removeItem('userEmail');
                $window.localStorage.removeItem('access_token');
            },
            
            registerEmail: function(user, inviteMode) {
                var deferred = $q.defer();
                var url = '/api/Account/Register';

                if (inviteMode) {
                    url = '/api/Account/CreateUserByAccount';
                }
                var that = this;
                $http({
                    method: 'POST',
                    url: url,
                    data: user,
                    headers: {'Content-Type': 'application/json'}
                }).success(function(data, status) {
                    if (status === 200) {
                        that.login(user, deferred).then(function(data) {
                            deferred.resolve(data);
                        }, function(error) {
                            deferred.reject(error);
                        });
                    } else {
                        isLogged = false;
                        userEmail = '';
                        deferred.reject(data.ModelState);
                    }
                }).error(function(data) {
                    isLogged = false;
                    userEmail = '';
                    deferred.reject(data);
                });

                return deferred.promise;
            },
            
            updateCompanySocialLinks: function(currentUser) {
                var d = $q.defer();

                $http({
                    method: 'POST',
                    url: 'api/Companies/UpdateSocialLinks',
                    data: {id: parseInt(currentUser.company_id), facebookPageUrl: currentUser.facebookPageUrl, instagrammPageUrl: currentUser.instagrammPageUrl, twitterPageUrl: currentUser.twitterPageUrl}
                }).success(function (data) {
                    d.resolve(data);
                }).error(function(data) {
                    d.reject(data);
                });

                return d.promise;
            },
            
            getUsersByRole: function(roleName) {
                var deferred = $q.defer(),
                    url = 'api/users/getUsers';

                $http({
                    method: 'GET',
                    url: url,
                    params: {role: roleName},
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            }
        };
    }
]);
