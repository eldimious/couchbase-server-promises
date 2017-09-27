'use strict';

const CouchbasePromisesWrapper = require('./couchbaseWrapper');

module.exports = function(config) {
  const couchbaseServerWrapper = new couchbaseWrapper(config);
  return couchbaseServerWrapper;
};
