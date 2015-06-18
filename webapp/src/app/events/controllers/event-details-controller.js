angular.module('gliist')
  .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', 'uploaderService', '$state', '$timeout', '$rootScope',
    function ($scope, $mdDialog, eventsService, dialogService, uploaderService, $state, $timeout, $rootScope) {
      'use strict';


      $scope.isStaff = function () {
        return $rootScope.isStaff();
      };

      $scope.isPromoter = function () {
        return $rootScope.isPromoter();
      };

      $scope.eventCategories = [
        'Art',
        'Fashion',
        'Music',
        'Charity',
        'Technology',
        'Gaming',
        'Sports',
        'Movies',
        'Films',
        'Others'
      ];

      $scope.data = {
        selectedIndex: 0,
        bottom: 'bottom'
      };

      $scope.glmOptions = {
        hideManualImport: true
      };

      $scope.getSelected = function (idx) {
        if ($scope.data.selectedIndex === idx) {
          return 'logo-bg';
        }

      };

      $scope.getEventInvite = function (height) {
        return {
          'background-image': "url(" + $scope.event.invitePicture + ")",
          'background-position': 'center center',
          'height': height || '250px',
          'background-repeat': 'no-repeat',
          'background-size': 'contain'
        };
      };


      $scope.onInviteSelected = function (files) {
        if (!files || files.length === 0) {
          return;
        }
        $scope.upload(files[0]);
      };


      $scope.upload = function (files) {
        $scope.fetchingData = true;
        uploaderService.uploadEventInvite(files, $scope.event.id).then(function (res) {
            $scope.event.invitePicture = res;
            dialogService.success('Invite saved');

          },
          function (err) {
            dialogService.error("There was a problem saving your image please try again");
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        )
      };


      $scope.onAddGLClicked = function (ev) {
        var scope = $scope.$new();
        scope.currentGlist = $scope.event;
        scope.cancel = $scope.cancel;
        scope.save = $scope.save;

        scope.selected = angular.copy($scope.event.guestLists);

        scope.options = {
          enableSelection: true,
          readOnly: true
        };

        scope.cancel = function () {
          $mdDialog.hide();
        };

        scope.importGLists = function () {
          eventsService.linkGuestList(scope.selected, $scope.event.id).then(
            function (guestListInstances) {
              $scope.event.guestLists = guestListInstances;
              dialogService.success('Guest lists were linked');
              $mdDialog.hide();
            }, function () {
              dialogService.error('There was a problem linking, please try again');
            }
          );
        };

        $mdDialog.show({
          //controller: DialogController,
          scope: scope,
          templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
          targetEvent: ev
        });
      };


      $scope.onCreateNewGuestList = function (ev) {

        var scope = $scope.$new();

        scope.currentGlist = {
          title: 'New Guest List',
          guests: []

        };

        scope.cancel = function () {
          $mdDialog.hide();
        };

        scope.save = function () {
          $scope.event.guestLists.push(scope.currentGlist);
        };

        $mdDialog.show({
          //controller: DialogController,
          scope: scope,
          templateUrl: 'app/guest-lists/templates/glist-edit-dialog.tmpl.html',
          targetEvent: ev
        });

      };

      $scope.eventTitleOnBlur = function () {
        $scope.showTitleValidation = true
      };

      $scope.displayDateErrorMessage = function (dateField) {

      };

      $scope.displayErrorMessage = function (field) {

        if (field === 'title' && $scope.showTitleValidation) {
          return;
        }

        return ($scope.showValidation) || (field.$touched && field.$error.required);
      };


      $scope.timeValid = function () {

        if ($scope.event.time < Date.now()) {
          $scope.timeInvalid = true;
          return false;
        }

        $scope.timeInvalid = false;

        if ($scope.event.time && $scope.event.endTime) {
          if ($scope.event.time > $scope.event.endTime) {
            $scope.endTimeInvalid = true;
            return false;
          }
        }
        $scope.timeInvalid = false;
        $scope.endTimeInvalid = false;

        return true;
      };

      $scope.dateOptions = {
        startingDay: 1,
        showWeeks: false
      };
      $scope.hourStep = 1;
      $scope.minuteStep = 15;
      $scope.showMeridian = true;

      $scope.timeOptions = {
        hourStep: [1, 2, 3],
        minuteStep: [1, 5, 10, 15, 25, 30]
      };

      $scope.next = function (form) {

        if ($scope.data.selectedIndex == 0 || $scope.data.selectedIndex == 2) {

          if (form && form.$invalid | !$scope.timeValid()) {
            $scope.showValidation = true;
            return;
          }
          $scope.savingEvent = true;
          eventsService.createEvent($scope.event).then(
            function (res) {
              $scope.event.id = res.id;
              $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 3);
              $scope.event.invitePicture = res.invitePicture;
              dialogService.success('Event ' + res.title + ' saved');

            }, function () {
              dialogService.error('There was a problem saving your event, please try again');
            }
          ).finally(
            function () {
              $scope.savingEvent = false;
            }
          );

          return;
        }

        $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 3);
      };
      $scope.previous = function () {
        $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
      };

      $scope.onFinishClicked = function () {

        $scope.savingEvent = true;
        eventsService.createEvent($scope.event).then(
          function (res) {
            $scope.event.id = res.id;
            dialogService.success('Event ' + res.title + ' saved');

            $state.go('main.event_summary', {eventId: $scope.event.id});

          }, function () {
            dialogService.error('There was a problem saving your event, please try again');
          }
        ).finally(
          function () {
            $scope.savingEvent = false;
          }
        )
      };

      $scope.createEvent = function () {
        $scope.savingEvent = true;
        eventsService.createEvent($scope.event).then(
          function (res) {
            $scope.event.id = res.id;
            dialogService.success('Event ' + res.title + 'saved');

          }, function () {
            dialogService.error('There was a problem saving your event, please try again');
          }
        ).finally(
          function () {
            $scope.savingEvent = false;
          }
        )
      };

      $scope.previewOptions = {hideEdit: true};

      $scope.location = {};

      $scope.minDate = Date.now();

      $scope.endMinDate = function () {
        return $scope.event.time || $scope.minDate;
      };

      $scope.resetPlaceholder = function () {

        if (!$("input[placeholder='Enter a location']").length) {
          $timeout($scope.resetPlaceholder, 100);
          return;
        }

        $("input[placeholder='Enter a location']").attr('placeholder', '');
      };

      $scope.$watch('location.details', function (newValue) {
        if (!newValue) {
          return;
        }

        $scope.event.timeZone = newValue.tz;
      });

      $scope.gliOptions = {
        showSummary: true
      };

      $scope.init = function () {

        if ($scope.isPromoter()) {
          $scope.data.selectedIndex = 2;
        }

        if ($scope.event) {
          return;
        }

        var d1 = new Date(),
          d2 = new Date(d1);
        d1.setHours(d1.getHours() + 6)
        d2.setHours(d1.getHours() + 12);

        $scope.event = {
          title: '',
          guestLists: [],
          time: d1,
          endTime: d2
        }
      };

    }]);
