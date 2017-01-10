'use strict';

angular.module('gliist').factory('uploaderService',
  ['$upload', '$q',
    function ($upload, $q) {
      return  {
        uploadGuestList: function (file, glId) {
          if (!file) {
            return $q.reject('Please select a file');
          }
          return $upload.upload({
            url: 'api/CSVController/CsvToGuestList',
            fields: {glId: glId},
            file: file
          }).then(function (response) {
            return response.data;
          }, function (err, s) {
            return $q.reject({data: err, status: s});
          });
        },

        uploadGuestListInstance: function (file, guestListInstanceId) {
          if (!file) {
            return $q.reject('Please select a file');
          }
          return $upload.upload({
            url: 'api/GuestListInstances/' + guestListInstanceId + '/Import/File',
            file: file
          }).then(function (response) {
            return response.data;
          }, function (err, s) {
            return $q.reject({data: err, status: s});
          });
        },

        upload: function (file) {
          var d = $q.defer();
          if (!file) {
            d.reject('Please select an image');
          }
          $upload.upload({
            url: 'api/account/ProfilePicture',
            fields: {},
            file: file
          }).success(function (data) {
            d.resolve(data);
          }).error(function (err) {
              d.reject(err);
            }
          );

          return d.promise;
        },

        uploadEventInvite: function (file, eventId) {
          var d = $q.defer();
          if (!file) {
            d.reject('Please select an image');
          }
          $upload.upload({
            url: 'api/GuestEventController/InvitePicture',
            params: {eventId: eventId},
            file: file
          }).success(function (data) {
            d.resolve(data);
          }).error(function (err) {
              d.reject(err);
            }
          );

          return d.promise;
        },
        
        isImgTypeSupported: function(file) {
          return !~['image/x-eps'].indexOf(file.type);
        }
      };
    }
  ]);
