'use strict';

const CouchbasePromisesWrapper = require('./couchbasePromisesWrapper');

module.exports = function(config) {
  const couchbaseServerWrapper = new CouchbasePromisesWrapper(config);
  return couchbaseServerWrapper;
};
