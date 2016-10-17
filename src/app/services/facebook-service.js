'use strict';

// https://developers.facebook.com/docs/facebook-login/web
// https://developers.facebook.com/docs/javascript/howto/angularjs

// User events API:
// https://developers.facebook.com/docs/graph-api/reference/user/events/

angular.module('gliist').factory('facebookService', [
  '$q',
  '$http',
  'dateService',
  function ($q, $http, dateService) {
    var facebookService = {
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
        return facebookService.login().then(function () {
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
        });
      },

      getEventData: function (eventId) {
        return facebookService.login().then(function (response) {
          var userId = response.authResponse.userID;
          var deferred = $q.defer();

          var fields = 'id, name, cover, start_time, end_time, place';
          var guestGroups = ['attending', 'maybe'];
          var guestFields = 'id, first_name, last_name, email, rsvp_status';

          angular.forEach(guestGroups, function (group) {
            fields += ', ' + group +'{' + guestFields + '}';
          });

          FB.api('/' + eventId, {fields: fields}, function (response) {
            var guests = [];
            angular.forEach(guestGroups, function (group) {
              if (response[group]) {
                guests = guests.concat(response[group].data);
              }
            });

            // Facebook includes event author in the guest lists.
            guests = guests.filter(function (guest) {
              return guest.id !== userId;
            });

            deferred.resolve({
              id: response.id,
              title: response.name,
              image: response.cover ? response.cover.source : null,
              startDate:response.start_time,
              endDate: response.end_time,
              location: response.place.name,
              guests: guests
            });
          });

          return deferred.promise;
        });
      },

      getEvents: function () {
        return facebookService.getUserData().then(function (user) {
          var deferred = $q.defer();

          // TODO: add pagination
          // TODO: add error handling
          FB.api('/' + user.id + '/events', {
            type: 'created',
            since: dateService.utc(new Date())
          }, function (response) {
            if (response && !response.error) {
              var promises = response.data.map(function (event) {
                return facebookService.getEventData(event.id);
              });
              $q.all(promises).then(function (events) {
                deferred.resolve(events);
              });
            }
          });

          return deferred.promise;
        });
      },

      parseFacebookEvent: function (event) {
        return {
          FacebookId: event.id,
          FacebookGuests: event.guests,
          title: event.title,
          time: dateService.utc(event.startDate),
          endTime: dateService.utc(event.endDate),
          location: event.location,
          invitePicture: event.image,
          type: 1,
          rsvpType: 3,
          guestLists: [],
          additionalGuests: 0,
          isRsvpCapacityLimited: false
        };
      },

      connectAccount: function () {
        return facebookService.login().then(function (response) {
          return $http.post('api/Account/IntegrateFacebook', {token: response.authResponse.accessToken});
        })
      }
    };
    return facebookService;
  }
]);
