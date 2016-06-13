'use strict';

angular.module('gliist').factory('uploaderService',
    ['$upload', '$q',
        function ($upload, $q) {
            return  {
                uploadGuestList: function (file, glId) {
                    var d = $q.defer();
                    if (!file) {
                        d.reject('Please select a file');
                    }
                    $upload.upload({
                        url: 'api/CSVController/CsvToGuestList',
                        fields: {glId: glId},
                        file: file
                    }).success(function (data) {
                        d.resolve(data);
                    }).error(function (err) {
                            d.reject(err);
                        }
                    );

                    return d.promise;
                },
                
                uploadGuestListInstance: function (file, guestListInstanceId) {
                    var d = $q.defer();
                    
                    if (!file) {
                        d.reject('Please select a file');
                    }
                    $upload.upload({
                        url: 'api/GuestListInstances/' + guestListInstanceId + '/Import/File',
                        file: file
                    }).success(function (data) {
                        d.resolve(data);
                    }).error(function (err) {
                        d.reject(err);
                    });

                    return d.promise;
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
                }

            };
        }
    ]);
