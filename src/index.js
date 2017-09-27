'use strict';

const CouchbaseWrapper = require('./couchbaseWrapper');

module.exports = function(config) {
  const couchbaseServerWrapper = new CouchbaseWrapper(config);
  return couchbaseServerWrapper;
};
