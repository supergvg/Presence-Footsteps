'use strict';

angular.module('gliist')
  .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', 'uploaderService', '$location', '$filter', 'subscriptionsService', 'permissionsService', '$state', 'userService',
    function ($scope, $mdDialog, eventsService, dialogService, uploaderService, $location, $filter, subscriptionsService, permissionsService, $state, userService) {
      $scope.eventCategories = [
        'Art',
        'Fashion',
        'Music',
        'Charity',
        'Technology',
        'Gaming',
        'Sports',
        'Food and wine',
        'Films',
        'Celebration',
        'School',
        'Others'
      ];
      $scope.selectedIndex = parseInt($location.search().view) || 0;
      $scope.dateOptions = {
        startingDay: 1,
        showWeeks: false
      };
      $scope.minuteStep = 15;
      $scope.utcOffset = 0;
      $scope.dt = {
        startEventDateTime: new Date(Date.now()),
        endEventDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endEventRsvpDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      $scope.eventStarted = false;
      $scope.eventFinished = false;
      $scope.minDate = Date.now();
      $scope.endMinDate = function() {
        return $scope.dt.startEventDateTime.getTime();
      };
      $scope.endMaxDate = function() {
        return $scope.dt.endEventDateTime.getTime();
      };
      $scope.maxTicketDate = function() {
        return $scope.dt.startEventDateTime.getTime() - 3 * 60 * 60 * 1000;
      };

      $scope.previewOptions = {
        hideEdit: true
      };
      $scope.location = {
        value: '',
        formatted: ''
      };
      $scope.tickets = [];
      $scope.gliOptions = {
        showSummary: true,
        details: true
      };

      $scope.onManagerClick = function() {
        subscriptionsService.verifyFeature('EventContributors', 0, true, $scope.event.id);
      };
      $scope.onStaffClick = $scope.onManagerClick;
      $scope.contributorsVisible = function () {
        return permissionsService.isRole('admin') || (permissionsService.isRole('manager') && !permissionsService.isRole('manager_limited'));
      };

      $scope.$watch('selectedIndex', function(newValue) {
        $location.search('view', newValue);
      });

      $scope.$watch('location.details', function(newValue) {
        if (!newValue) {
          return;
        }
        if (newValue.geometry) {
          $.ajax({
            url: 'https://maps.googleapis.com/maps/api/timezone/json?location=' +
            newValue.geometry.location.lat() + ',' +
            newValue.geometry.location.lng() + '&timestamp=' +
            (Math.round(Date.now() / 1000)).toString() + '&sensor=false'
          }).done(function(response) {
            $scope.utcOffset = response.dstOffset + response.rawOffset;
          });
          if (newValue.adr_address.indexOf(newValue.name) + 1) {
            $scope.location.formatted = newValue.adr_address;
          } else {
            $scope.location.formatted = '<span class="venue-name">'+newValue.name+', </span>'+newValue.adr_address;
          }
        }
      });

      $scope.$watch('dt.endEventDateTime', function(newValue) {
        if (newValue.getTime() < $scope.dt.endEventRsvpDateTime.getTime()) {
          $scope.dt.endEventRsvpDateTime = new Date(newValue.getTime());
        }
      });

      $scope.$watch('event.type', function(newValue, oldValue) {
        if (newValue !== oldValue && newValue === 2) {
          if (!subscriptionsService.verifyFeature('RSVP', null, {}, $scope.event.id)) {
            $scope.event.type = oldValue;
            subscriptionsService.isPayed().then(function(){
              $scope.event.type = 2;
            });
          }
          $scope.dt.endEventRsvpDateTime = new Date($scope.dt.endEventDateTime.getTime());
        }
      });

      $scope.isPromoter = function() {
        return permissionsService.isRole('promoter');
      };

      $scope.getSelected = function(idx) {
        return ($scope.selectedIndex === idx);
      };

      $scope.getEventInvite = function(height) {
        return {
          'background-image': 'url("' + $scope.event.invitePicture + '")',
          'background-position': 'center center',
          'height': height || '250px',
          'background-repeat': 'no-repeat',
          'background-size': 'contain'
        };
      };

      $scope.onInviteSelected = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        $scope.upload(files[0]);
      };

      $scope.upload = function(files) {
        $scope.fetchingData = true;
        uploaderService.uploadEventInvite(files, $scope.event.id).then(function(res) {
            $scope.event.invitePicture = res;
            dialogService.success('Invite saved');
          },
          function() {
            dialogService.error('There was a problem saving your image please try again');
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        );
      };

      $scope.onCreateGLClicked = function (instanceType) {
        eventsService.createGuestList($scope.event.id, instanceType).then(
          function (data) {
            $state.go('main.create_gl_event', {id: data, eventId: $scope.event.id});
          }, function (error) {
            dialogService.error(error && error.data && error.data.Message ? error.data.Message : 'There was a problem creating guest list, please try again');
          }
        );
      };

      $scope.onAddGLClicked = function(ev, instanceType) {
        var scope = $scope.$new();
        scope.cancel = function() {
          $mdDialog.hide();
        };
        scope.selected = [];
        scope.options = {
          display: {
            enableSelection: true,
            readOnly: true,
            verticalScroll: false
          }
        };
        scope.rsvpOnly = instanceType === 2;
        scope.importGLists = function(ev) {
          if (!subscriptionsService.verifyFeature('Guests', $scope.getTotalGuests(scope.selected), ev, $scope.event.id)) {
            return;
          }
          eventsService.linkGuestList(scope.selected, $scope.event.id, instanceType).then(
            function (guestListInstances) {
              $scope.event.guestLists = guestListInstances;
              dialogService.success('Guest lists were linked');
              $mdDialog.hide();
            }, function (error) {
              if (error.status === 403) {
                return subscriptionsService.verifyFeature('Guests', error.data, true, $scope.event.id);
              }
              dialogService.error(error && error.data && error.data.Message ? error.data.Message : 'There was a problem linking, please try again');
            }
          );
        };
        $mdDialog.show({
          scope: scope,
          templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
          targetEvent: ev
        });
      };

      $scope.timeValid = function() {
        $scope.startEventTimeInvalid = false;
        $scope.endEventTimeInvalid = false;
        $scope.startRangeDays = subscriptionsService.getFeatureValue('EventStartRangeDays') || 45;

        if ($scope.dt.endEventRsvpDateTime.getTime() > $scope.dt.endEventDateTime.getTime()) {
          $scope.dt.endEventRsvpDateTime = new Date($scope.dt.endEventDateTime.getTime());
        }
        var now = new Date(Date.now()),
          locationDateTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + $scope.utcOffset * 1000);

        if ($scope.dt.startEventDateTime.getTime() < locationDateTime.valueOf()) {
          $scope.startEventTimeInvalid = true;
        }
        if ($scope.dt.startEventDateTime.getTime() > $scope.dt.endEventDateTime.getTime()) {
          $scope.endEventTimeInvalid = true;
        }
        if ($scope.startEventTimeInvalid || $scope.endEventTimeInvalid) {
          return false;
        }
        return true;
      };

      $scope.next = function(ev, form) {
        if (ev && ev.pointer && ev.pointer.type === 'm') {
          return;
        }
        if ([0, 1, 3].indexOf($scope.selectedIndex) === -1) {
          $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 4);
          return;
        }
        var featureInternalId = $scope.event.id ? $scope.event.id : 'NEWEVENT';
        if ($scope.event.capacity && !subscriptionsService.verifyFeature('Guests', $scope.event.capacity, ev, featureInternalId)) {
          return;
        }
        if (!subscriptionsService.verifyFeature('EventDurationDays', ($scope.dt.endEventDateTime.getTime() - $scope.dt.startEventDateTime.getTime()) / 1000 / 60 / 60 / 24, ev, featureInternalId)) {
          return;
        }
        if (!subscriptionsService.verifyFeature('EventStartRangeDays', (($scope.dt.startEventDateTime.getTime() - new Date().getTime()) / 1000 / 60 / 60 / 24), ev, featureInternalId)) {
          return;
        }
        var errorMessage = [];
        if (form && form.$invalid) {
          var errors = {
            required: {
              title: 'Please Enter Event Title',
              category: 'Please Select Event Category',
              /*location: 'Please Enter Event Location',*/
              capacity: 'Please Enter Event Capacity'
            },
            pattern: {
              title: 'Event Title can only contain alphabets, digits and spaces'
            },
            number: {
              capacity: 'Please enter numbers only'
            }
          };
          angular.forEach(form.$error, function (value, key) {
            if (errors[key]) {
              angular.forEach(value, function (value1) {
                if (errors[key][value1.$name]) {
                  errorMessage.push(errors[key][value1.$name]);
                }
              });
            }
          });
        }
        if (!$scope.timeValid()) {
          if ($scope.eventFinished) {
            errorMessage.push('Can\'t update the event since event has started');
          }
          if ($scope.startEventTimeInvalid && !$scope.eventStarted) {
            errorMessage.push('Cant Create Event in the Past');
          }
          if ($scope.endEventTimeInvalid) {
            errorMessage.push('End time has to be after start time');
          }
        }
        if (!$scope.location.details) {
          errorMessage.push('Please enter the city of the event or event location');
        }
        if ($scope.event.type === 3 && !$scope.isHasOneTicket()) {
          errorMessage.push('Please specify at least one ticket tier');
        }
        if (errorMessage.length > 0) {
          dialogService.error(errorMessage.join(', '));
          return;
        }

        $scope.savingEvent = true;
        $scope.event.location = $scope.location.formatted;
        $scope.event.time = $scope.convertDateTime($scope.dt.startEventDateTime);
        $scope.event.endTime = $scope.convertDateTime($scope.dt.endEventDateTime);
        $scope.event.rsvpEndDate = $scope.convertDateTime($scope.dt.endEventRsvpDateTime);
        eventsService.createEvent($scope.event).then(
          function (res) {
            $scope.event.id = res.id;
            if ($scope.event.FacebookId && !$scope.selectedIndex) {
              $scope.selectedIndex = 2;
            } else {
              $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 4);
            }
            $scope.event.invitePicture = res.invitePicture;
            $scope.event.rsvpUrl = res.rsvpUrl;
            $scope.event.ticketingUrl = res.ticketingUrl;
            $scope.event.facebookPageUrl = res.facebookPageUrl;
            $scope.event.instagrammPageUrl = res.instagrammPageUrl;
            $scope.event.twitterPageUrl = res.twitterPageUrl;
            dialogService.success('Event ' + res.title + ' saved');
            $location.path('/main/event/edit/' + $scope.event.id);
          }, function () {
            dialogService.error('There was a problem saving your event, please try again');
          }
        ).finally(function () {
          $scope.savingEvent = false;
        });
      };

      $scope.previous = function(ev) {
        if (ev && ev.pointer.type === 't' || angular.isUndefined(ev)) {
          if ($scope.event.FacebookId && $scope.selectedIndex === 2) {
            $scope.selectedIndex = 0;
          } else {
            $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
          }
        }
      };

      $scope.convertDateTime = function(date) {
        var convertDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000),
          dateStr = convertDate.toISOString().replace(/\..+$/, ''),
          offset = new Date(Math.abs($scope.utcOffset) * 1000);
        return dateStr+($scope.utcOffset < 0 ? '-' : '+')+('0'+offset.getUTCHours()).slice(-2)+':'+('0'+offset.getUTCMinutes()).slice(-2);
      };

      $scope.clearLocation = function() {
        delete $scope.location.details;
      };

      $scope.getTotalGuests = function(guestLists) {
        var total = 0;
        angular.forEach(guestLists, function(gl){
          if (angular.isDefined(gl.guestsCount)) {
            total += gl.guestsCount;
          } else if (angular.isDefined(gl.total)) {
            total += gl.total;
          }
        });
        return total;
      };

      $scope.init = function() {
        if (permissionsService.isRole('promoter') && $scope.selectedIndex !== 3 && $scope.selectedIndex !== 4) {
          $scope.selectedIndex = 3;
        }

        if (!$scope.event) {
          $scope.event = {
            title: '',
            guestLists: [],
            time: '',
            endTime: '',
            type: 1,
            rsvpType: 3,
            additionalGuests: 0,
            isRsvpCapacityLimited: false,
            rsvpEndDate: ''
          };
        }

        if ($scope.event.FacebookId && $scope.selectedIndex === 1) {
          $scope.selectedIndex = 2;
        }

        $scope.$watch('event', function (event) {
          if (event.location) {
            $scope.location.details = {};
            $scope.location.formatted = event.location;
            $scope.location.value = $scope.location.formatted.replace(/<[^>]+>/gm, '');
          }

          if (event.time) {
            event.endTime = event.endTime || event.time;
            event.rsvpEndDate = event.rsvpEndDate || event.time;

            var parseDate = event.time.split(/[^0-9]/);
            $scope.utcOffset = event.time.substr(19, 1) + (parseDate[6] * 60 * 60 + parseDate[7] * 60);
            $scope.dt.startEventDateTime = $filter('ignoreTimeZone')(event.time);
            $scope.dt.endEventDateTime = $filter('ignoreTimeZone')(event.endTime);
            $scope.dt.endEventRsvpDateTime = $filter('ignoreTimeZone')(event.rsvpEndDate);
            if (new Date(event.time) < Date.now()) {
              $scope.eventStarted = true;
            }
            if (new Date(event.endTime) < Date.now()) {
              $scope.eventFinished = true;
            }
          }

          if (event.type === 3) {
            $scope.getTickets(event.id);
          }
        });

        userService.getUsersByRole("manager_limited").then(function (data) {
          $scope.managers = [{id: null, firstName: "None", lastName: ""}].concat(data);
        });
        userService.getUsersByRole("staff_limited").then(function (data) {
          $scope.staff = [{id: null, firstName: "None", lastName: ""}].concat(data);
        });
      };

    }]);
