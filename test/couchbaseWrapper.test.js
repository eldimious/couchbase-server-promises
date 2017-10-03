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
const CouchbaseLib = require('../lib/couchbaseWrapper');
const couchbaseWrapper = new CouchbaseLib(config);

describe('test connection:', function() {
  it('should connect to local DB', function (done) {
    const connectedBuckets = couchbaseWrapper.getConnectedBuckets();
    expect(connectedBuckets.includes('users')).to.eql(true);
    return done();
  });

  it('should be connected to invalid bucket', function (done) {
    const connectedBuckets = couchbaseWrapper.getConnectedBuckets();
    expect(connectedBuckets.includes('usersTest')).to.eql(false);
    return done();
  });

});


describe('test functions to handle the result of the asynchronous operations:', function() {
  it('should be able to get doc from local DB bucket', function (done) {
    couchbaseWrapper.getDoc('users', 'user:dimostest1')
      .then((userDoc) => {
        expect(userDoc.value).to.not.be.empty;
        expect(userDoc.value).to.be.an('object');
        expect(userDoc.value.name).to.eql('dimostest1');
        return done();
      });
  });

  it('should not be able to get doc from local DB bucket as the doc does not exist', function (done) {
    couchbaseWrapper.getDoc('users', 'user:dimostestnew')
      .catch((error) => {
        expect(error.code).to.be.equal(13);
        return done();
      });
  });

  it('should return error as we try get doc from bucket without connection', function (done) {
    couchbaseWrapper.getDoc('usersTestBucket', 'user:dimostestnew')
      .catch((error) => {
        expect(error).to.be.equal('No bucket connection for usersTestBucket');
        return done();
      });
  });
});
