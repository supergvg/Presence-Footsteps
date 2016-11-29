'use strict';

angular.module('gliist')
  .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'eventsService', 'userService', '$timeout', '$mdDialog', 'uploaderService', 'guestListParserService', '$stateParams', 'permissionsService', '$mdTheming', 'subscriptionsService',
    function ($scope, guestFactory, dialogService, $state, eventsService, userService, $timeout, $mdDialog, uploaderService, guestListParserService, $stateParams, permissionsService, $mdTheming, subscriptionsService) {
      var instanceType = parseInt($stateParams.instanceType),
        eventId = parseInt($stateParams.eventId);
      $scope.guestTypeDisabled = true;
      $scope.guestListTypes = [
        'GA',
        'VIP',
        'Super VIP',
        'Guest',
        'Artist',
        'Production',
        'Comp',
        'Press',
        'All Access',
        'Reduced',
        'Parking Pass',
        'Shuttle Pass',
        'Table Service'
      ];
      $scope.defaultFields = {
        firstName: '',
        lastName: '',
        email: '',
        notes: '',
        plus: 0
      };
      $scope.canEdit = function () {
        return !$scope.fetchingData;
      };
      $scope.canEditPlus = function () {
        return !$scope.isRSVP() && !$scope.isPublicRSVP(); //disable editing for RSVP list
      };

      $scope.isRSVP = function () {
        return instanceType === 2;
      };

      $scope.isPublicRSVP = function () {
        return instanceType === 4;
      };
      $scope.isFacebookList = function () {
        return $scope.gli && $scope.gli.listType === 'Facebook';
      };
      $scope.options = {
        filter: {
          active: true,
          placeholder: 'Search Guest',
          fields: ['guest.firstName', 'guest.lastName', 'guest.email'],
          filterFunction: function(renderableRows, filterValue, originalFilter, fieldFilter) {
            var filterWords;
            var firstNameField = $scope.options.filter.fields[0];
            var lastNameField = $scope.options.filter.fields[1];
            var firstNameFilter;
            var lastNameFilter;
            if (filterValue.indexOf(' ') !== -1) {
              filterWords = filterValue.split(/\s+/);
              firstNameFilter = new RegExp('^' + filterWords[0], 'i');
              lastNameFilter = new RegExp('^' + filterWords[1], 'i');
              renderableRows.forEach(function(row) {
                var match = fieldFilter(row, firstNameField, firstNameFilter) &&
                  fieldFilter(row, lastNameField, lastNameFilter);
                if (!match) {
                  row.visible = false;
                }
              });
              return renderableRows;
            } else {
              return originalFilter(renderableRows, filterValue);
            }
          }
        },
        sorting: {
          active: true
        },
        display: {
          totalMobileViewportItems: 2,
          totalViewportItems: 7,
          enableGridSelection: true,
          enableEditCells: true
        },
        gridOptions: {
          cellEditableCondition : $scope.canEdit,
          columnDefs: [
            {field: 'guest.firstName', name: 'First Name'},
            {field: 'guest.lastName', name: 'Last Name'},
            {field: 'guest.email', name: 'Email', cellEditableCondition: function () { return $scope.canEdit() && !$scope.isPublicRSVP(); }},
            {field: 'guest.notes', name: 'Note', enableSorting: false, cellEditableCondition: function () { return $scope.canEdit() && !$scope.isPublicRSVP(); }},
            {field: 'guest.plus', name: 'Plus', type: 'number', enableSorting: false, editableCellTemplate: '<div><form name="inputForm"><input type="INPUT_TYPE" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD" min="0"></form></div>', cellEditableCondition: function () { return $scope.canEdit() && $scope.canEditPlus(); }}
          ]
        }
      };
      $scope.form = {};
      $scope.data = { textGuestList: null };

      $scope.options.methods = {
        gridCellTab: function(event, col) {
          if (event.keyCode === 9 && col.uid === col.grid.columns[col.grid.columns.length - 1].uid) {
            $scope.addMore();
            $timeout(function(){
              $scope.gridApi.cellNav.scrollToFocus($scope.gli.actual[$scope.gli.actual.length - 1], $scope.options.gridOptions.columnDefs[0]);
            }, 100);
          }
        },
        onRegisterApi: function(gridApi){
          $scope.gridApi = gridApi;
          var rowSelectionChanged = function() {
            $scope.rowSelected = gridApi.selection.getSelectedRows();
            if ($scope.rowSelected.length === 0) {
              $scope.rowSelected = false;
            }
          };

          gridApi.selection.on.rowSelectionChanged($scope, rowSelectionChanged);
          gridApi.selection.on.rowSelectionChangedBatch($scope, rowSelectionChanged);

          gridApi.edit.on.beginCellEdit($scope,function(){
            $scope.cancelAutoSave();
          });

          gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
            if (newValue !== oldValue) {
              if (!rowEntity.guest.plus) {
                rowEntity.guest.plus = 0;
              }
              $scope.onDataChange();
            } else {
              $scope.startAutoSave();
            }
          });

          gridApi.edit.on.cancelCellEdit($scope,function(){
            $scope.startAutoSave();
          });
        }
      };
      $scope.rowSelected = false;
      $scope.isDirty = false;

      $scope.$watchCollection('gli', function(newVal) {
        if (!newVal) {
          return;
        }
        $scope.options.gridData = $scope.gli.actual;
      });

      $scope.$watch('id', function(newValue) {
        if (!newValue) {
          return;
        }
        $scope.loading = true;
        guestFactory.GuestListInstance.get({id: $scope.id}).$promise.then(function(data) {
          $scope.gli = data;
          instanceType = data.instanceType;
          $scope.guestTypeDisabled = !!data.listType || $scope.isFacebookList();

          if ($scope.gli.instanceType === 2) {
            $scope.options.gridOptions.columnDefs.splice(4);
          }
          userService.getUsersByRole('promoter').then(
            function(users){
              $scope.promoters = [{Id: 0, firstName: 'None', lastName: ''}];
              $scope.promoters = $scope.promoters.concat(users);
              $scope.loading = false;
            },
            function() {
              dialogService.error('Oops there was a problem loading promoter users, please try again');
            }
          );
        }, function() {
          dialogService.error('There was a problem getting your events, please try again');
          $state.go('main.current_events');
        }).finally(function() {
          $scope.loading = false;
        });
      });

      $scope.isPromoter = function() {
        return permissionsService.isRole('promoter');
      };

      $scope.disablePromoterList = function() {
        return $scope.isPromoter() || !subscriptionsService.verifyFeature('EventContributors', 0, null, eventId) || $scope.isSpotType();
      };
      $scope.onPromoterClick = function() {
        subscriptionsService.verifyFeature('EventContributors', 0, true, eventId);
      };

      $scope.isSpotType = function() {
        if (!$scope.gli) {
          return false;
        }
        return $scope.gli.listType === 'On the spot';
      };


      $scope.startAutoSave = function() {
        if ($scope.isDirty === false) {
          return;
        }

        $scope.cancelAutoSave();
        $scope.autoSave = $timeout(function(){
          if (!$scope.guestsError() && !$scope.fetchingData) {
            $scope.save(true);
          }
        }, 7000);
      };
      $scope.cancelAutoSave = function() {
        if ($scope.autoSave) {
          $timeout.cancel($scope.autoSave);
          delete $scope.autoSave;
        }
      };

      $scope.addMore = function() {
        if ($scope.isSpotType()) {
          return;
        }
        if (!$scope.gli) {
          $scope.gli = {};
        }
        if (!$scope.gli.actual) {
          $scope.gli.actual = [];
        }
        $scope.gli.actual.push({
          gl_id: $scope.gli.id,
          status: 'no show',
          guest: angular.extend({}, $scope.defaultFields)
        });
      };

      $scope.deleteSelectedRows = function() {
        if (!$scope.rowSelected) {
          return;
        }
        $scope.fetchingData = true;
        $scope.cancelAutoSave();
        var guestIds = [];
        angular.forEach($scope.rowSelected, function(row){
          if (row.guest.id) {
            guestIds.push(row.guest.id);
          } else {
            var index = $scope.gli.actual.indexOf(row);
            if (index > -1) {
              $scope.gli.actual.splice(index, 1);
            }
          }
        });
        if (guestIds.length > 0) {
          var rowSelected = $scope.rowSelected;
          eventsService.removeGuestsFromGLInstance($scope.gli.id, guestIds).then(
            function() {
              angular.forEach(rowSelected, function(row){
                if (row.guest.id) {
                  var index = $scope.gli.actual.indexOf(row);
                  if (index > -1) {
                    $scope.gli.actual.splice(index, 1);
                  }
                }
              });
            }
          ).finally(function () {
            $scope.fetchingData = false;
          });
        } else {
          $scope.fetchingData = false;
        }
        $scope.rowSelected = false;
      };

      $scope.validateForm = function () {
        var errorMessage = [];
        if (!$scope.form.createGuestListForm.$valid) {
          var errors = {
            required: {
              title: 'Please Enter Guest List Title',
              listType: 'Please Select Guest Type'
            }
          };
          angular.forEach($scope.form.createGuestListForm.$error.required, function(value){
            errorMessage.push(errors.required[value.$name]);
          });
        }
        if ($scope.guestsError()) {
          errorMessage.push(instanceType === 2 || instanceType === 4 ? 'Email must be not empty.' : 'First Name must be not empty.');
        }

        return errorMessage;
      };

      $scope.save = function(autoSave, forceSaveGuest, onSuccess) {
        var errors = $scope.validateForm();
        if (errors.length) {
          if (!autoSave) {
            dialogService.error(errors.join(', '));
          }
          return;
        }

        if ($scope.onBeforeSave && !$scope.onBeforeSave($scope.gli, !autoSave)) {
          return;
        }
        if (!$scope.gli.listType) {
          $scope.gli.listType = 'GA';
        }

        /*if (!forceSaveGuest) { //will cause second check before sending data
         var list = $scope.gli.actual.slice();
         var duplicated = [];

         var i = 0;
         while (list[i]) {
         var fn = list[i].guest.firstName;
         var ln = list[i].guest.lastName;

         for (var j = i; j < list.length; j++) {
         if (fn === list[j].guest.firstName && ln === list[j].guest.lastName && i != j) {
         duplicated.push(list[j].guest);
         list.splice(j, 1); //remove from temporary list to eliminate cross-checking
         j--;
         }
         }

         i++;
         }

         if (duplicated.length)
         return $scope.confirmDuplicatedGuests(autoSave, duplicated);
         }*/

        var gli = {};
        angular.copy($scope.gli, gli);
        if (forceSaveGuest) {
          gli.ForceSaveGuest = true;
        }

        $scope.cancelAutoSave();
        $scope.fetchingData = true;
        guestFactory.GuestListInstance.update(gli).$promise.then(
          function(data) {
            if (!autoSave) {
              $scope.gli = data;
            } else {
              $scope.gli.id = data.id;
              var savedGuestsId = [],
                newSavedGuests = [];
              angular.forEach($scope.gli.actual, function(guest) {
                if (guest.guest.id) {
                  savedGuestsId.push(guest.guest.id);
                }
              });
              angular.forEach(data.actual, function(guest) {
                if (savedGuestsId.indexOf(guest.guest.id) === -1) {
                  newSavedGuests.push(guest);
                }
              });
              angular.forEach($scope.gli.actual, function(guest, key) {
                if (!guest.guest.id) {
                  angular.forEach(newSavedGuests, function(newGuest, newKey){
                    if (guest.guest.firstName === newGuest.guest.firstName && guest.guest.lastName === newGuest.guest.lastName && guest.guest.email === newGuest.guest.email) {
                      $scope.gli.actual[key].id = newGuest.id;
                      $scope.gli.actual[key].guest.id = newGuest.guest.id;
                      delete newSavedGuests[newKey];
                      return;
                    }
                  });
                }
              });
            }
            var message = 'Guest list saved';
            if (autoSave) {
              message = 'Guest list autosaved';
            }
            dialogService.success(message);
            $scope.isDirty = false;
            if (onSuccess) {
              onSuccess(function() {
                if ($scope.onSave && !autoSave) {
                  $scope.onSave(data);
                }
              });
            } else if ($scope.onSave && !autoSave) {
              $scope.onSave(data);
            }

          }, function(error) {
            subscriptionsService.process403Status(error, eventId);
            if (error.status === 409) {
              $scope.confirmDuplicatedGuests(autoSave, error.data);
            } else {
              dialogService.error(error.data.Message || 'There was a problem saving your guest list, please try again');
            }
          }
        ).finally(function() {
          $scope.fetchingData = false;
        });
      };

      $scope.confirmDuplicatedGuests = function (autoSave, list) {
        var htmlcontent = '<p>These names are already in the guest list:</p>\n<ul>';
        angular.forEach(list, function(item) {
          htmlcontent += '<li>' + item.firstName + ' ' + item.lastName + '</li>';
        });
        htmlcontent += '</ul><p>Do you want to delete them?</p>';

        $mdDialog.show({
          template: [
            '<md-dialog md-theme="{{ dialog.theme }}" aria-label="">',
            '<md-dialog-content role="document" tabIndex="-1">',
            htmlcontent,
            '</md-dialog-content>',
            '<div class="md-actions">',
            '<md-button ng-click="dialog.hide()" class="md-primary">Yes</md-button>',
            '<md-button ng-click="dialog.abort()" class="md-primary">No</md-button>',
            '</div>',
            '</md-dialog>'
          ].join(''),
          controller: function mdDialogCtrl() {
            this.hide = function() {
              $mdDialog.hide(true);
            };
            this.abort = function() {
              $mdDialog.cancel();
            };
          },
          controllerAs: 'dialog',
          bindToController: true,
          theme: $mdTheming.defaultTheme()
        }).then(function() {
          var ids = [];
          angular.forEach(list, function(item) {
            var l = $scope.gli.actual;
            var i = 0;
            if (item.id === 0) { //id = 0 if returned by back end
              while(l[i]) {
                if (l[i].guest.firstName === item.firstName && l[i].guest.lastName === item.lastName && l[i].guest.id === undefined) {
                  l.splice(i, 1);
                  i--;
                }
                i++;
              }
            } else if (item.id === undefined) { //id = undefined if returned by front end
              while(l[i]) {
                if (l[i].guest === item) {
                  l.splice(i, 1);
                  i--;
                }
                i++;
              }
            } else { //remove on back end
              ids.push(item.id);
            }
          });

          if (ids.length) {
            $scope.save(autoSave, true, function(onSave) {
              $scope.fetchingData = true;
              eventsService.removeGuestsFromGLInstance($scope.gli.id, ids).then( function(data) {
                $scope.gli = data;
                if (onSave) {
                  onSave();
                }
              }).finally(function () {
                $scope.fetchingData = false;
              });
            });
          } else {
            $scope.save(autoSave);
          }
        }, function() {
          $scope.save(autoSave, true);
        });
      };

      $scope.guestsError = function() {
        var result = false;
        if (!$scope.gli) {
          return result;
        }

        var guestCount = $scope.gli.actual.length,
          verifyField = 'firstName';
        if (instanceType === 2 || instanceType === 4) { //if RSVP or Public RSVP
          verifyField = 'email';
        }
        for (var i = 0; i < guestCount; i++) {
          if ($scope.gli.actual[i].guest[verifyField] === '') {
            return true;
          }
        }

        return result;
      };

      $scope.onLinkClicked = function (ev) {
        var errors = $scope.validateForm();
        if (errors.length) {
          return dialogService.error(errors.join(', '));
        }

        var scope = $scope.$new();
        scope.cancel = function () {
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
        scope.rsvpOnly = $scope.isRSVP() || $scope.isPublicRSVP();

        scope.importGLists = function() {
          $scope.cancelAutoSave();
          $scope.save(true, false, function(onSave){
            eventsService.importGuestsToGLInstance($scope.gli.id, scope.selected, $scope.gli).then(
              function (result) {
                if (!result) {
                  return dialogService.error('There was a problem linking your guest list, please try again');
                }
                $scope.gli.actual = result.actual;
                $scope.save(true);
              },
              function (error) {
                if (error.status === 403) {
                  return subscriptionsService.verifyFeature('Guests', error.data, true, eventId);
                }
                dialogService.error(error && error.data && error.data.Message ? error.data.Message : 'There was a problem linking your guest list, please try again');
              }
            ).finally(function () {
              $mdDialog.hide();
            });
            if (onSave) {
              onSave();
            }
          });
        };

        $mdDialog.show({
          scope: scope,
          templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
          targetEvent: ev
        });
      };

      $scope.onAddGuestsClicked = function() {
        if (!$scope.data.textGuestList) {
          return;
        }

        var guests = guestListParserService.parse($scope.data.textGuestList);
        if (guests === null) {
          return dialogService.error('No guests found in the list');
        }
        if (typeof guests === 'string') {
          return dialogService.error(guests);
        }

        //import
        if (!$scope.gli) {
          $scope.gli = {};
        }
        if (!$scope.gli.actual) {
          $scope.gli.actual = [];
        }

        var guestCount = guests.length;
        for (var i = 0; i < guestCount; i ++) {
          $scope.gli.actual.push({
            gl_id: $scope.gli.id,
            status: 'no show',
            guest: guests[i]
          });
        }
        $scope.isDirty = true;

        dialogService.success('Guests were added successfully');
        $scope.onDataChange();
        $scope.data.textGuestList = '';
      };

      $scope.onFileSelect = function (files) {
        if (!files || files.length === 0) {
          return;
        }

        var errors = $scope.validateForm();
        if (errors.length) {
          return dialogService.error(errors.join(', '));
        }

        $scope.cancelAutoSave();
        $scope.save(true, true, function(onSave){
          $scope.upload(files[0], $scope.gli.id);
          if (onSave) {
            onSave();
          }
        });
        return;
      };

      $scope.onDataChange = function () {
        $scope.isDirty = true;
        $scope.startAutoSave();
      };

      $scope.upload = function (files, glId) {
        $scope.fetchingData = true;
        uploaderService.uploadGuestListInstance(files, glId).then(
          function (data) {
            $scope.gli = data;
            $scope.save(true);
          },
          function (response) {
            if (response) {
              if (response.status === 403) {
                return subscriptionsService.verifyFeature('Guests', response.data, true, eventId);
              }

              if (response.data) {
                return dialogService.error(response.data);
              }
            }

            dialogService.error('There was a problem saving your guest list please try again');
          }
        ).finally(function () {
          $scope.fetchingData = false;
        });
      };
    }]
  );
