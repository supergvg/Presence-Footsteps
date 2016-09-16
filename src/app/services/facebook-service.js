'use strict';

// https://developers.facebook.com/docs/javascript/howto/angularjs

angular.module('gliist').factory('facebookService', [
  function () {
    return  {
      login: function() {
        FB.getLoginStatus(function(response) {
          console.log(response);
        });
      }
    };
  }
]);
