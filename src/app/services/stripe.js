'use strict';

function StripeClass() {
    var handler = StripeCheckout.configure({
        key: 'pk_test_1cPZoQpYmIz6O0kLMy3oJ1Cc',
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
        }
    });
    this.openCheckout = function(details) {
        handler.open({
            name: 'Gjests',
            description: details.description,
            amount: details.amount * 100
        });
    };
}

angular.module('gliist').service('stripe', StripeClass);