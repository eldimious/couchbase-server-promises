const expect = require('chai').expect;
const sinon = require('sinon');
const Promise = require('bluebird');

const config = {
  cluster: 'couchbase://127.0.0.1:8091',
    buckets: [
      {
        bucket: 'users',
        password: 'users',
      },
    ],
};
const couchbasePromisesWrapper = require('../lib/couchbaseWrapper');
const couchbaseServerWrapper = new couchbasePromisesWrapper(config);

describe('test connection:', function() {
  it('should connect to local DB', function (done) {
    const connectedBuckets = couchbaseServerWrapper.getConnectedBuckets();
    expect(connectedBuckets.includes('users')).to.eql(true);
    return done();
  });
});
