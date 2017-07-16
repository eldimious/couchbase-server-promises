'use strict';

const CouchbaseWrapperService = require('../src/couchbasePromisesWrapper');

module.exports = function(config) {
  console.log("Here take the config", config);
  const couchbaseServerWrapper = new CouchbaseWrapperService(config);
  console.log("this._couchbaseServer", couchbaseServerWrapper)
  return couchbaseServerWrapper;
};
