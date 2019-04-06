'use strict';

const Couchbase = require('couchbase');
const Promise = require('bluebird');
const {
  couchbaseMethods,
} = require('./utils');

const {
  ViewQuery,
  N1qlQuery,
} = Couchbase;

module.exports = class couchbaseWrapper {
  constructor(config) {
    this._cluster = new Couchbase.Cluster(config.cluster);
    this._connections = {};
    this._getDoc = {};
    this._upsertDoc = {};
    this._insertDoc = {};
    this._replaceDoc = {};
    this._removeDoc = {};
    this._getMultiDoc = {};
    this._query = {};
    this._ViewQuery = ViewQuery;
    this._N1qlQuery = N1qlQuery;

    this._cluster.authenticate(config.user, config.password);
    for (let i = 0; i < config.buckets.length; i++) {
      const bucketName = config.buckets[i].bucket;
      if (!bucketName) {
        throw new Error('You should add a bucket name in buckets in config. Take a look at github example to see the correct config.');
      }
      if (!this._connections[bucketName]) {
        this._connections[bucketName] = this._cluster.openBucket(config.buckets[i].bucket, config.buckets[i].password, (err) => {
          if (err) {
            throw new Error(`${bucketName} bucket perform cluster.openBucket error in couchbase-server-database`);
          }
          if (config.buckets[i].operationTimeout) {
            this._connections[bucketName].operationTimeout = config.buckets[i].operationTimeout;
          }
        });
      }
      couchbaseMethods.reduce((acc, method) => {
        this[`_${method}Doc`][bucketName] = Promise.promisify(this._connections[bucketName][method], {
          context: this._connections[bucketName],
        });
        return;
      }, {});
      this._query[bucketName] = Promise.promisify(this._connections[bucketName].query, {
        context: this._connections[bucketName],
      });
    }
  }

  get ViewQuery() {
    return this._ViewQuery;
  }

  get N1qlQuery() {
    return this._N1qlQuery;
  }

  getDoc(bucket, docId) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._getDoc[bucket](docId);
  }

  upsertDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._upsertDoc[bucket](docId, newDoc);
  }

  insertDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._insertDoc[bucket](docId, newDoc);
  }

  replaceDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._replaceDoc[bucket](docId, newDoc);
  }

  removeDoc(bucket, docId) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._removeDoc[bucket](docId);
  }

  getMultiDocs(bucket, docId) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._getMultiDoc[bucket](docId);
  }

  query(bucket, view) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._query[bucket](view);
  }

  getBucketManager(bucket) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._connections[bucket].manager();
  }

  getConnectedBuckets() {
    if (!this._cluster || !this._cluster.connectingBuckets || this._cluster.connectingBuckets.length <= 0) {
      return Promise.reject(new Error('No cluster connection.'));
    }
    const bucketsName = this._cluster.connectingBuckets.map(bucket => bucket._name);
    return bucketsName;
  }

  disconnectBucket(bucket) {
    if (!this._connections[bucket]) {
      return Promise.reject(new Error(`No bucket connection for ${bucket}`));
    }
    return this._connections[bucket].disconnect();
  }
};
