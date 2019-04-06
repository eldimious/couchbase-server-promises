'use strict';

const {
  validateConfiguration,
} = require('./validationService');
const CouchbaseWrapper = require('./couchbaseWrapper');

module.exports = function init(config) {
  try {
    validateConfiguration(config);
  } catch (error) {
    throw error;
  }
  const couchbaseServerWrapper = new CouchbaseWrapper(config);
  return couchbaseServerWrapper;
};
