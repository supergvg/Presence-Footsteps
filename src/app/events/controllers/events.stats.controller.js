'use strict';

function EventsStatsController (
  $scope,
  $window,
  $state,
  $stateParams,
  $mdMedia,
  eventsService,
  offlineReportService,
  dialogService,
  EnvironmentConfig) {
  $scope.eventId = $stateParams.eventId;

  $scope.categories = [
    {name: 'GA', color: '#d4e4f9'},
    {name: 'VIP', color: '#f7f9c3'},
    {name: 'Super VIP', color: '#cfefdc'},
    {name: 'Guest', color: '#cef0f2'},
    {name: 'Artist', color: '#ffd8b4'},
    {name: 'Production', color: '#ead5e1'},
    {name: 'Comp', color: '#f3d4f9'},
    {name: 'All Access', color: '#c9badb'},
    {name: 'Press', color: '#e0e0e0'},
    {name: 'RSVP', color: '#ffd8b4'},
    {name: 'Reduced', color: '#f9e6e2'},
    {name: 'Walk up', color: '#bbe4f9'},
    {name: 'On the spot', color: '#f0f6fb'},
    {name: 'Parking Pass', color: '#dcecf9'},
    {name: 'Shuttle Pass', color: '#fef5d5'},
    {name: 'Table Service', color: '#feded6'}
  ];
  $scope.rsvp = [
    {name: 'Invited', color: '#cef0f2', total: 0},
    {name: 'RSVP\'d', color: '#f7f9c3', total: 0},
    {name: 'RSVP checked in', color: '#ffd8b4', total: 0}
  ];
  $scope.rsvpTotalVisitors = 0;
  $scope.Math = $window.Math;
  $scope.gliOptions = {
    readOnly: true,
    stats: true
  };
  $scope.stats = {};
  $scope.totalGuests = 0;
  $scope.totalCheckedIn = 0;
  $scope.eventType = 1;
  $scope.table1Visible = $mdMedia('gt-sm');
  $scope.table2Visible = $mdMedia('gt-sm');

  $scope.$watch(function() { return !$mdMedia('gt-sm'); }, function(status) {
    $scope.isMobile = status;
  });

  $scope.calculateStats = function() {
    if (!$scope.event) {
      return;
    }
    var category = '';
    angular.forEach($scope.event.guestLists, function(gl) {
      category = gl.listType ? gl.listType.toLowerCase() : '';
      if (!$scope.stats[category]) {
        $scope.stats[category] = {
          totalCheckedIn: 0,
          total: 0
        };
      }

      angular.forEach(gl.actual, function(guest) {
        var addGuests = guest.guest.plus + 1 - guest.plus;
        if (guest.status === 'checked in') {
          $scope.stats[category].totalCheckedIn += addGuests;
          $scope.totalCheckedIn += addGuests;
        }
      });
      if (gl.instanceType !== 2 && gl.instanceType !== 4) {//include all except for unpublished private RSVP
        $scope.stats[category].total += gl.guestsCount;
      }

      if ($scope.isRSVP()) {
        //RSVP stats
        if (gl.instanceType === 2 && gl.published) {
          $scope.rsvp[0].total += gl.guestsCount;
          angular.forEach(gl.actual, function(guest) {
            $scope.rsvp[1].total += guest.guest.plus + 1;
          });
          $scope.rsvp[2].total = $scope.stats[category].totalCheckedIn;
          $scope.stats[category].total = $scope.rsvp[1].total;
        } else if (gl.instanceType === 4) {
          $scope.rsvp[1].total += gl.guestsCount;
          $scope.rsvp[2].total = $scope.stats[category].totalCheckedIn;
          $scope.stats[category].total = $scope.rsvp[1].total;
        }
      }
    });

    var totalGuests = 0;
    angular.forEach($scope.stats, function(category) {
      totalGuests += category.total;
    });
    $scope.totalGuests = totalGuests;

    eventsService.getRSVPVisitors($scope.event.id).then(
      function(data) {
        $scope.rsvpTotalVisitors = data;
      }
    );
    $scope.updateChart();
  };

  $scope.isRSVP = function() {
    return $scope.eventType === 2;
  };

  $scope.getExportExcelUrl = function() {
    return EnvironmentConfig.gjests_api+'api/reports/exportrsvp/'+$scope.event.id+'?authToken='+$window.localStorage.access_token;
  };

  $scope.getCategoryStats = function(category) {
    return $scope.stats[category.toLowerCase()] || {totalCheckedIn: 0, total: 0};
  };

  $scope.updateChart = function() {
    $scope.chartObject = {
      type: 'PieChart',
      options: {
        titlePosition: 'none',
        legend: 'none',
        colors: $scope.categories.map(function(category){
          return category.color;
        }),
        chartArea: {left: 0, top: '5%', width: '100%', height: '90%'},
        pieSliceText: 'label'
      },
      data: {
        cols: [
          {id: 't', label: 'Topping', type: 'string'},
          {id: 's', label: 'Slices', type: 'number'}
        ],
        rows: []
      }
    };
    angular.forEach($scope.categories, function(category) {
      $scope.chartObject.data.rows.push({
        c: [{v: category.name}, {v: $scope.getCategoryStats(category.name).totalCheckedIn}]
      });
    });

    if ($scope.isRSVP()) {
      var rsvp = angular.copy($scope.rsvp);
      rsvp.sort(function(a, b){
        if (a.total > b.total) {
          return 1;
        }
        if (a.total < b.total) {
          return -1;
        }
      });
      var names = [''],
        totals = [''];
      rsvp.forEach(function(item, i, arr){
        names.push(item.name);
        names.push({role: 'tooltip'});
        if (i > 0) {
          totals.push(arr[i].total - arr[i - 1].total);
        } else {
          totals.push(item.total);
        }
        totals.push(item.name+': '+item.total);
      });
      $scope.chartObjectRSVP = {
        type: 'ColumnChart',
        options: {
          legend: 'none',
          colors: rsvp.map(function(item){ return item.color; }),
          chartArea: {left: '5%', top: '5%', width: '100%', height: '90%'},
          bar: { groupWidth: '20%' },
          isStacked: true,
          vAxis: {gridlines: {count: 3}, viewWindow: {max: rsvp[$scope.rsvp.length - 1].total}}
        },
        data: [names, totals]
      };
    }

    $scope.getOfflineStats = function () {
      offlineReportService.getStats($scope.eventId).then(function (stats) {
        $scope.offlineStats = stats.data;
      });
    };

    $scope.getOfflineModeReportUrl = function() {
      return EnvironmentConfig.gjests_api+'api/OfflineMode/Report/'+$scope.eventId+'?authToken='+$window.localStorage.access_token;
    };
  };

  $scope.init = function() {
    $scope.initializing = true;
    eventsService.getEvents($scope.eventId).then(
      function(data) {
        $scope.event = data;
        $scope.eventType = $scope.event.type;
        $scope.calculateStats();
        $scope.getOfflineStats();
      }, function() {
        dialogService.error('There was a problem getting your events, please try again');
        $state.go('main.current_events');
      }
    ).finally(function() {
      $scope.initializing = false;
    });
  };
}

EventsStatsController.$inject = [
  '$scope',
  '$window',
  '$state',
  '$stateParams',
  '$mdMedia',
  'eventsService',
  'offlineReportService',
  'dialogService',
  'EnvironmentConfig'
];

angular.module('gliist')
    .controller('EventsStatsCtrl', EventsStatsController);
