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
            }, {
              scope: 'public_profile, email, user_events'
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
              id: response.id,
              firstName: response.first_name,
              lastName: response.last_name,
              email: response.email
            });
          }
        });

        return deferred.promise;
      },

      getEventData: function (eventId) {
        var deferred = $q.defer();

        FB.api('/' + eventId, {fields: 'id, name, cover, start_time, end_time, place'}, function (response) {
          console.log('event', response);
          deferred.resolve({
            id: response.id,
            name: response.name,
            image: response.cover.source,
            startDate: response.start_time,
            endDate: response.end_time,
            location: response.place.name
          });
        });

        return deferred.promise;
      },

      getEvents: function (userId) {
        var self = this;
        var deferred = $q.defer();

        // TODO: add pagination
        // TODO: account for event timezone
        // TODO: add error handling
        FB.api('/' + userId + '/events', {type: 'created'}, function (response) {
          console.log('events', response);
          if (response && !response.error) {
            var promises = response.data.map(function (event) {
              return self.getEventData(event.id);
            });
            $q.all(promises).then(function (events) {
              deferred.resolve(events);
            });
          }
        });

        return deferred.promise;
      }
    };
  }
]);
