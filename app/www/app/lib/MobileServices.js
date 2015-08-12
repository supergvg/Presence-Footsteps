angular.module('starter').factory('mobileServices', [ '$rootScope', '$ionicPlatform',
    function ($rootScope, $ionicPlatform) {


        var GCM_SENDER_ID = '435632896637'; //Replace with your own ID
        var mobileServiceClient;
        var pushNotification;
        var _companyId;


// Create the Azure client register for notifications.
        $rootScope.registerPush = function (companyId) {

            _companyId = companyId;

            mobileServiceClient = new WindowsAzure.MobileServiceClient(
                "https://gjests.azure-mobile.net/",
                "NFNdaMQwfsCXXBTEBpFtfFHyVUMoNW10"
            );

            // Create a pushNotification (from the PushPlugin).
            pushNotification = window.plugins.pushNotification;

            // Platform-specific registrations.
            if (device.platform == 'android' || device.platform == 'Android') {
                // Register with GCM for Android apps.
                pushNotification.register(successHandler, errorHandler,
                    {
                        "senderID": GCM_SENDER_ID,
                        "ecb": "onGcmNotification"
                    });
            } else if (device.platform === 'iOS') {
                // Register with APNS for iOS apps.
                pushNotification.register(tokenHandler, errorHandler,
                    {
                        "badge": "false",
                        "sound": "false",
                        "alert": "true",
                        "ecb": "onApnsNotification"
                    });
            }
        };

// Handle a GCM notification.
        window.onGcmNotification = function (e) {
            if (!$rootScope.currentUser) {
                return;
            }

            var tag = $rootScope.currentUser.company_id;
            switch (e.event) {
                case 'registered':
                    // Handle the registration.
                    if (e.regid.length > 0) {
                        console.log('gcm id ' + e.regid);
                        if (mobileServiceClient) {
                            // Template registration.
                            var template = '{ "data" : {"message":"$(message)"}}';
                            // Register for notifications.
                            mobileServiceClient.push.gcm.registerTemplate(e.regid,
                                'myTemplate', template, [tag])
                                .done(function () {
                                    //alert('Registered template with Azure!');
                                }).fail(function (error) {
                                    //alert('Failed registering with Azure: ' + error);
                                });
                        }
                    }
                    break;
                case 'message':
                    if (e.foreground) {
                        // Handle the received notification when the app is running
                        // and display the alert message.
                        //alert(e.payload.message);
                        // Reload the items list.
                        //refreshTodoItems();
                    }
                    break;
                case 'error':
                    // alert('GCM error: ' + e.message);
                    break;
                default:
                    // alert('An unknown GCM event has occurred');
                    break;
            }
        }

// Receive the APNS token.
        function tokenHandler(result) {
            if (mobileServiceClient) {
                // This is a template registration.
                var template = "{\"aps\":{\"alert\":\"$(message)\"}}";
                // Register for notifications.
                // (deviceId, templateName, templateBody, expiration, ["tag1","tag2"]) // template params w/ tags
                mobileServiceClient.push.apns.registerTemplate(result, 'myTemplate', template, [_companyId]).done(function () {
                    //alert('Registered Azure!');
                }).fail(function (error) {
                    //alert('Failed registering with Azure: ' + error);
                });
            }
        }

        function onApnsNotification(event) {
            if (event.alert) {
                //window.goToAlerts();
            }
        }

// GCM registration success handler.
        function successHandler(result) {
            console.debug('GCM registration result: ' + result);
        }

//
        function errorHandler(error) {
            console.debug('An error occured during registration: ' + error);
        }


        return {

            init: function () {
                $ionicPlatform.ready(function () {
                    $rootScope.$watch('currentUser', function (newVal, oldVal) {

                        if (!newVal || newVal === oldVal) {
                            return;
                        }

                        $rootScope.registerPush(newVal.company_id);

                    });
                });
            }
        }
    }
]);


