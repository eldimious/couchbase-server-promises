'use strict';
const Couchbase = require('couchbase');
const Promise = require('bluebird');
const ViewQuery = Couchbase.ViewQuery;


module.exports = class couchbaseWrapper {
  constructor(config) {
    if (!config || !config.cluster) {
      throw new Error('Couchbase connection string not supplied to Database. Take a look at github example to see the correct config.');
    }
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

    const bucketArray = config.buckets || [];  
    if (bucketArray.length <= 0) {
      throw new Error('You should add bucket in buckets in config. Take a look at github example to see the correct config.');
    }
    //construct connections for all buckets and create private variables to handle callback functions using promises.
    for (let i = 0; i < bucketArray.length; i++) {
      const bucketName = bucketArray[i].bucket;     
      if (!bucketName) {
        throw new Error('You should add a bucket name in buckets in config. Take a look at github example to see the correct config.');
      }
      if (!this._connections[bucketName]) {
        this._connections[bucketName] = this._cluster.openBucket(bucketArray[i].bucket, bucketArray[i].password, err => {
          if (err) {
            throw new Error(`${bucketName} bucket perform cluster.openBucket error in couchbase-server-database`);
          }
          if (bucketArray[i].operationTimeout) {
            this._connections[bucketName].operationTimeout = bucketArray[i].operationTimeout;
          }
        });
      }
      this._getDoc[bucketName] = Promise.promisify(this._connections[bucketName].get, {context: this._connections[bucketName]});
      this._upsertDoc[bucketName] = Promise.promisify(this._connections[bucketName].upsert, {context: this._connections[bucketName]});
      this._insertDoc[bucketName] = Promise.promisify(this._connections[bucketName].insert, {context: this._connections[bucketName]});
      this._replaceDoc[bucketName] = Promise.promisify(this._connections[bucketName].replace, {context: this._connections[bucketName]});
      this._removeDoc[bucketName] = Promise.promisify(this._connections[bucketName].remove, {context: this._connections[bucketName]});
      this._getMultiDoc[bucketName] = Promise.promisify(this._connections[bucketName].getMulti, {context: this._connections[bucketName]});
      this._query[bucketName] = Promise.promisify(this._connections[bucketName].query, {context: this._connections[bucketName]});
    }
  }

  get ViewQuery() {
    return this._ViewQuery;
  };

  getDoc(bucket, docId) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._getDoc[bucket](docId);
  }

  upsertDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._upsertDoc[bucket](docId, newDoc);
  }

  insertDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._insertDoc[bucket](docId, newDoc);
  }

  replaceDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._replaceDoc[bucket](docId, newDoc);
  }

  removeDoc(bucket, docId) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._removeDoc[bucket](docId);
  }

  getMultiDocs(bucket, docId) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._getMultiDoc[bucket](docId);
  }

  query(bucket, view) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._query[bucket](view);
  }

  getBucketManager(bucket) {
    if (!this._connections[bucket]) {
      return Promise.reject(`No bucket connection for ${bucket}`);
    }
    return this._connections[bucket].manager();
  }

  getConnectedBuckets() {
    if (!this._cluster || !this._cluster.connectingBuckets || this._cluster.connectingBuckets.length <= 0) {
      return Promise.reject('No cluster connection.');
    }
    const bucketsName = this._cluster.connectingBuckets.map(bucket => bucket._name);
    return bucketsName;
  }
}
