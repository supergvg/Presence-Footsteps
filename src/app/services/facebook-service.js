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
      },

      getEvents: function () {
        var events = [
          {
            id: 1,
            title: 'Waterfight NYC 2016 #StayWet',
            img: 'http://loremflickr.com/150/150/cat',
            startDate: new Date(),
            endDate: new Date(),
            location: 'Sheep Meadow, Central Park, New York, New Your 10023'
          },
          {
            id: 2,
            title: 'Kickstarter Summer Festival 2016',
            img: 'http://loremflickr.com/150/150/cat',
            startDate: new Date(),
            endDate: new Date(),
            location: 'Fort Greene Park, Brooklyn, New York 11217'
          },
          {
            id: 3,
            title: 'Quiet Clubbing Party Cruise',
            img: 'http://loremflickr.com/150/150/cat',
            startDate: new Date(),
            endDate: new Date(),
            location: 'Circle Line Sightseeing Cruises, Pier 83, West 42nd Street & 12th Avenue, New York, New York 10036'
          }
        ];
        return $q.resolve(events);
      }
    };
  }
]);
