'use strict';

angular.module('gliist')
  .controller('EventsStatsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$stateParams', '$state',
    function ($scope, $mdDialog, eventsService, dialogService, $stateParams, $state) {


      $scope.cssStyle = "height:400px; width:100%;";


      $scope.categories = [
        'GA',
        'VIP',
        'Guest',
        'Artist',
        'Production',
        'Comp',
        'Others'
      ];

      $scope.getCategoryStatus = function (category) {

        var count = 0;
        if (!$scope.event) {
          return;
        }
        angular.forEach($scope.event.guestLists,
          function (gl) {

            angular.forEach(gl.actual,
              function (chkn) {

                if (chkn.status !== 'checked in') {
                  return;
                }

                if (chkn.guest.type === category) {
                  count += chkn.guest.plus + 1 - chkn.plus;
                }
                else if (gl.listType === category) {
                  count += chkn.guest.plus + 1 - chkn.plus;
                }

              });
          }
        );

        return count;
      };

      $scope.getCategoryTotal = function (category) {

        var count = 0;

        if (!$scope.event) {
          return;
        }

        angular.forEach($scope.event.guestLists,
          function (gl) {

            angular.forEach(gl.actual,
              function (guest_info) {

                if (guest_info.guest.type === category) {
                  count += guest_info.guest.plus + 1;
                }
                else if (gl.listType === category) {
                  count += guest_info.guest.plus + 1;
                }

              });
          }
        );

        return count;
      };

      $scope.updateChart = function (event) {
        $scope.chartObject = {
          type: 'PieChart',
          options: {
            title: '',
            backgroundColor: '#ECECEC',
            legend: 'none',
            colors: ['#35A9A9', '#42E19E', '#949494', '#9369E9', '#EA69D0'],
            chartArea: {left: 0, top: '10%', width: '100%', height: '75%'},
            pieSliceText: 'none',
          },
          data: {
            cols: [
              {id: "t", label: "Topping", type: "string"},
              {id: "s", label: "Slices", type: "number"}
            ],
            rows: []
          }
        };

        angular.forEach(event.guestLists, function (gl) {
          $scope.chartObject.data.rows.push({
            c: [
              {
                v: gl.listType
              },
              {
                v: gl.actual.length
              }
            ]
          });
        });

      };

      $scope.$watch('event', function (newValue) {
        if (!newValue) {
          return;
        }

        $scope.updateChart(newValue);
      });

      $scope.options = {
        local: true
      };

      $scope.gliOptions = {
        readOnly: true
      };

      $scope.currentEvents = [];
      $scope.init = function () {

        var eventId = $stateParams.eventId;

        $scope.initializing = true;

        eventsService.getEvents(eventId).then(function (data) {
          $scope.event = data;

          $scope.currentEvents.push(data);

          $scope.chips = {
            tags: [
              $scope.event.category
            ],
            readonly: true
          };


        }, function () {
          dialogService.error('There was a problem getting your events, please try again');

          $state.go('main.current_events');
        }).finally(
          function () {
            $scope.initializing = false;
          }
        )


      };

    }]);
