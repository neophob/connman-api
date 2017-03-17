'use strict';
/*
 * Javascript interface around Service API
 * See: https://git.kernel.org/cgit/network/connman/connman.git/tree/doc/service-api.txt
 *
 */

const util = require('util');
const events = require('events');

const DEFAULT_TIMEOUT = 10000;

const Service = module.exports = function(connman) {
  this.connman = connman;
  this.service = null;
  this.technology = null;
};

util.inherits(Service, events.EventEmitter);

Service.prototype.init = function(technologyType, serviceName, callback) {
  this.technology = this.connman.technologies[technologyType];
  this.name = serviceName;
  this.selectService(serviceName, function(err) {
    if (callback) callback(err);
  });
};

Service.prototype.getProperties = function(callback) {
  var svc = this.service;
  if (!svc) {
    process.nextTick(function() {
      callback(new Error('No service was found'));
    });
    return;
  }
  svc.GetProperties.timeout = DEFAULT_TIMEOUT;
  svc.GetProperties.error = callback;
  svc.GetProperties.finish = function(props) { callback(null, props); };
  svc.GetProperties();
};

Service.prototype.setProperty = function(prop, value, callback) {
  var svc = this.service;
  if (!svc) {
    if (callback) {
      process.nextTick(function() {
        callback(new Error('No service was found'));
      });
    }
    return;
  }
  svc.SetProperty.timeout = DEFAULT_TIMEOUT;
  svc.SetProperty.error = callback || null;
  svc.SetProperty.finish = callback || null;
  svc.SetProperty(prop, value);
};

Service.prototype.connect = function(callback) {
  var self = this;
  var svc = this.service;
  if (!this.technology) {
    if (callback) {
      process.nextTick(function() {
        callback(new Error('No technology was found'));
      });
    }
    return;
  }
  if (!svc) {
    if (callback) {
      process.nextTick(function() {
        callback(null);
      });
    }
    return;
  }
  // Establish connection
  self.service.Connect.timeout = 30000;
  self.service.Connect();
  // Make sure again to listen for PropertyChanged
  self.service.removeAllListeners('PropertyChanged');
  self.service.on('PropertyChanged', function(name, value) {
      self.emit('PropertyChanged', name, value);
  });
  if(self.connman.enableAgent) {
    // Return agent for this connection
    callback(null, self.connman.Agent);
  } else {
    callback(null);
  }
};

Service.prototype.disconnect = function(callback) {
  var svc = this.service;
  if (!this.technology) {
    if (callback) {
      process.nextTick(function() {
        callback(new Error('No technology was found'));
      });
    }
    return;
  }
  if (!svc) {
    if (callback) {
      process.nextTick(function() {
        callback(null);
      });
    }
    return;
  }
  svc.Disconnect.error = callback || null;
  svc.Disconnect.finish = callback || null;
  //svc.removeAllListeners('PropertyChanged');
  svc.Disconnect();
};

Service.prototype.selectService = function(objectPath, callback) {
	var self = this;
  if (!this.technology) {
    if (callback) {
      process.nextTick(function() {
        callback(new Error('No technology was found'));
      });
    }
    return;
  }
  self.connman.systemBus.getInterface('net.connman', objectPath, 'net.connman.Service', function(err, iface) {
    if (err) {
      callback(new Error('No such service'));
      return;
    }
    // Release current service we used
    if (self.service) {
      self.service.removeAllListeners('PropertyChanged');
    }
    // Set new service
    self.service = iface;
    // Initializing signal handler for this new service
    iface.on('PropertyChanged', function(name, value) {
      self.emit('PropertyChanged', name, value);
    });
    if (callback) callback(null, iface);
  });
};
