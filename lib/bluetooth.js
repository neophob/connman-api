'use strict';
/*
 * Javascript interface around Service API of type Bluetooth
 * See: https://git.kernel.org/cgit/network/connman/connman.git/tree/doc/service-api.txt
 *
 */

const util = require('util');
const Service = require('./service');

const super_ = Service.prototype;

const Bluetooth = module.exports = function(connman) {
  Service.call(this, connman);
};

util.inherits(Bluetooth, Service);

Bluetooth.prototype.init = function(serviceName, callback) {
  super_.init('Bluetooth',serviceName, callback);
};
