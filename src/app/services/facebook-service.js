'use strict';

// https://developers.facebook.com/docs/facebook-login/web
// https://developers.facebook.com/docs/javascript/howto/angularjs

angular.module('gliist').factory('facebookService', [
  '$q',
  function ($q) {
    return  {
      login: function () {
        var deferred = $q.defer();

        FB.getLoginStatus(function (response) {
          if (response.status === 'connected') {
            // Logged into both Facebook and FB app.
            deferred.resolve(response);
          } else {
            FB.login(function (response){
              if (response.status === 'connected') {
                // Logged into both Facebook and FB app.
                deferred.resolve(response);
              } else {
                deferred.reject(response);
              }
            });
          }
        });

        return deferred.promise;
      },

      getUserData: function () {
        var deferred = $q.defer();

        FB.api('/me', {fields: 'first_name, last_name, email'}, function (response) {
          if (!response || response.error) {
            deferred.reject(response ? response.error : null);
          } else {
            deferred.resolve({
              firstName: response.first_name,
              lastName: response.last_name,
              email: response.email
            });
          }
        });

        return deferred.promise;
      }
    };
  }
]);
