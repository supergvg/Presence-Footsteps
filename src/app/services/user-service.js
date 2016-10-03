'use strict';

angular.module('gliist').factory('userService', ['$rootScope', '$http', '$q', '$window', 'EnvironmentConfig',
  function ($rootScope, $http, $q, $window, EnvironmentConfig) {
    var userEmail;
    var isLogged;
    var access_token;
    var userData;
    var setAuthToken = function(token) {
      access_token = token;
      if (token !== '') {
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
      }
    };
    var onLoginSuccessful = function(data) {
      if (!data.access_token) {
        throw 'Trying to save empty access token';
      }
      // successful login
      isLogged = true;
      userEmail = data.userName;
      setAuthToken(data.access_token);
      try { $window.localStorage.setItem('access_token', data.access_token);} catch(e) {}
    };
    var cacheKey = Date.now();

    return {
      resetCacheKey: function() {
        cacheKey = Date.now();
      },

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
        }).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });

        return deferred.promise;
      },

      deleteCompany: function(data) {
        var deferred = $q.defer(),
          url = 'api/Account/BlockCompany';

        $http({
          method: 'POST',
          url: url,
          data: data
        }).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
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
        }).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
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

      getUserPhoto: function(height, currentUser) {
        var bgImg;

        if (currentUser) {
          bgImg = EnvironmentConfig.gjests_api + 'api/account/ProfilePicture/?userId=' + currentUser.userId + '&suffix=' + cacheKey;
          bgImg = 'url("' + bgImg + '")';
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
        if (isLogged || access_token) {
          return true;
        }
        if ($window.localStorage.getItem('access_token') && !access_token) {
          setAuthToken($window.localStorage.getItem('access_token'));
          return true;
        }
        return false;
      },

      login: function(credentials) {
        var d = $q.defer(),
          body = 'grant_type=password&username=' + encodeURIComponent(credentials.username) + '&password=' + encodeURIComponent(credentials.password);

        $http.post('Token', body, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(
          function(response) {
            onLoginSuccessful(response.data);
            d.resolve();
          },
          function(response) {
            isLogged = false;
            userEmail = '';
            d.reject(response);
          }
        );

        return d.promise;
      },

      logout: function() {
        isLogged = false;
        userEmail = '';
        setAuthToken('');
        $rootScope.currentUser = null;

        $window.localStorage.removeItem('access_token');
      },

      registerEmail: function(user, inviteMode) {
        var deferred = $q.defer(),
          url = inviteMode ? 'api/Account/CreateUserByAccount' : 'api/Account/Register',
          that = this;

        $http.post(url, user, {headers: {'Content-Type': 'application/json'}}).then(
          function() {
            that.login(user).then(function() {
              deferred.resolve();
            }, function(response) {
              deferred.reject(response.data);
            });
          },
          function(response) {
            isLogged = false;
            userEmail = '';
            deferred.reject(response.data);
          }
        );

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
      },

      markCurrentUserAsLoggedInAtLeastOnce: function() {
        var d = $q.defer();

        $http({
          method: 'POST',
          url: 'api/Account/MarkCurrentUserAsLoggedInAtLeastOnce'
        }).success(function(data) {
          d.resolve(data);
        }).error(function(data) {
          d.reject(data);
        });

        return d.promise;
      }
    };
  }
]);
