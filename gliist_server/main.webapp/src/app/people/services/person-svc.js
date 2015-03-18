
angular.module('agora')
    .service('personService', ['$q', '$http', 'pluginsService',
        function ($q, $http, pluginsService) {

            var that = {};

            that.followProfile = function (profile, person) {
                var deferred = $q.defer();

                if (!profile) {
                    deferre.reject('Invalid profile - undefined');
                }

                $http({
                    method: 'POST',
                    url: '/api/memory/FollowSocialProfile/',
                    params: {
                        'social_id': profile.social_id,
                        'source': profile.source,
                        'living_object_id': person ? person.livingObjectId : null
                    }
                }).
                  success(function (res) {
                      deferred.resolve(res);
                  }).
                  error(function (err) {
                      deferred.reject(err);
                  });

                return deferred.promise;
            };

            that.getAvailablePlugins = function (person) {

                var retval = [];
                var allPlugins = pluginsService.getAvailablePlugins();

                if (!person) {
                    return allPlugins;
                }

                angular.forEach(allPlugins, function (plugin) {

                    var pluginLinked = false;
                    for (var i = 0; i < person.linkedProfiles.length; i++) {
                        if (person.linkedProfiles[i].source === plugin.name) {
                            pluginLinked = true;
                            break;
                        }
                    }

                    if (!pluginLinked) {
                        retval.push(plugin);
                    }
                });

                return retval;
            };

            that.getPersons = function (searchQuery) {

                var deferred = $q.defer();

                $http({
                    method: 'GET',
                    url: '/api/memory/GetLivingObjects/',
                    params: {
                        searchQuery: searchQuery ? searchQuery : ''
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

            return that;
        }]);