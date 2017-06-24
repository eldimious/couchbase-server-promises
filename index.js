'use strict';

const CouchbaseDatabase = require('./database');

class CouchbaseUsingPromises {
  constructor(config) {
    this.db = new CouchbaseDatabase(config);
  }
}

//const CouchbaseInstance = new CouchbaseUsingPromises(couchbase);

module.exports = CouchbaseUsingPromises;
