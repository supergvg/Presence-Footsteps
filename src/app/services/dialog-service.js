'use strict';

angular.module('gliist').factory('dialogService', [ '$mdToast', '$mdDialog',
    function ($mdToast, $mdDialog) {
        return  {
            error: function(err) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(err)
                        .position('center center')
                        .hideDelay(3000)
                );
            },

            success: function(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('center center')
                        .hideDelay(50000)
                );
            },
            
            confirm: function(event, content, labelOk, labelCancel, classes) {
                var confirm = $mdDialog.confirm()
                        .content(content || '')
                        .ok(labelOk || 'Yes')
                        .targetEvent(event),
                    isCloseButton = labelCancel && labelCancel !== '';
                if (isCloseButton) {
                    confirm.cancel(labelCancel || 'Cancel');
                }
                confirm._options.template = '<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}"' + (classes ? ' class="' + classes + '"' : '') + '><img src="assets/images/popup-close.png" ng-click="dialog.abort()" style="display:none"/><md-dialog-content role="document" tabIndex="-1"><h2 class="md-title">{{ dialog.title }}</h2><p ng-bind-html="dialog.content" style="font-size: 20px;"></p></md-dialog-content><div class="md-actions" style="padding: 0 20px 20px 20px;">' + (isCloseButton ? '<md-button ng-if="dialog.$type == \'confirm\'" ng-click="dialog.abort()" class="md-primary">{{ dialog.cancel }}</md-button>' : '') + '<md-button ng-click="dialog.hide()" class="md-primary">{{ dialog.ok }}</md-button></div></md-dialog>';
                
                return $mdDialog.show(confirm);
            }
        };
    }
]);
