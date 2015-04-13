angular.module('gliist').factory('uploaderService',
    ['$upload', '$q',
        function ($upload, $q) {
            return  {
                uploadGuestList: function (file) {
                    var d = $q.defer();
                    if (!file) {
                        d.reject('Please select a file');
                    }
                    return $upload.upload({
                        url: 'api/CSVController/CsvToGuestList',
                        fields: {},
                        file: file
                    }).success(function (data) {
                        d.resolve(data);
                    }).error(function (err) {
                            d.resolve(err);
                        }
                    );

                    return d.promise;
                },

                upload: function (file) {
                    var d = $q.defer();
                    if (!file) {
                        d.reject('Please select an image');
                    }
                    return $upload.upload({
                        url: 'api/account/ProfilePicture',
                        fields: {},
                        file: file
                    }).success(function (data) {
                        d.resolve(data);
                    }).error(function (err) {
                            d.resolve(err);
                        }
                    );

                    return d.promise;
                },

                uploadBatch: function (files) {
                    if (!files || !files.length) {
                        return;
                    }
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        $upload.upload({
                            url: 'api/account/ProfilePicture',
                            fields: {},
                            file: file
                        }).progress(function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        });

                    }
                }
            }
        }
    ]);
