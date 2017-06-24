'use strict';
const CouchbaseDatabase = require('./database');

class CouchbasePromises {
  constructor(config) {
    this.db = new CouchbaseDatabase(config);
  }
}

module.exports = CouchbasePromises;
