'use strict';

const couchbase = require('couchbase');
const Promise = require('bluebird');
const debug = require('debug')('couchbase-server-promises');

module.exports = class CouchbasePromises {
  constructor(config) {
    debug('start constructing instance of CouchbasePromises class');

    if (typeof config === 'object' && config.cluster) {
      this._cluster = new couchbase.Cluster(config.cluster);
    } else {
      throw new Error('Couchbase connection string not supplied to Database');
    }

    this._connections = {};
    this._getDoc = {};
    this._upsertDoc = {};
    this._insertDoc = {};
    this._replaceDoc = {};
    this._removeDoc = {};
    this._getMultiDoc = {};
    this._makeQuery = {};

    const bucketArray = config.buckets || [];  

    if (bucketArray.length <= 0) {
      throw new Error('You should add bucket in buckets in config.');
    }

    for (let i = 0; i < bucketArray.length; i++) {
      console.log("bucketArray[i]", bucketArray[i])

      const bucketName = bucketArray[i].password;
      console.log("bucketName", bucketName)
      
      if (!bucketName) {
        throw new Error('You should add a bucket name in buckets in config.');
      }

      console.log("bucketName", bucketName)

      if (!this._connections.bucketArray || !this._connections.bucketArray[i]) {
        this._connections[bucketName] = this._cluster.openBucket(bucketArray[i].bucket, bucketArray[i].password, function(err) {
          if (err) {
            console.log("error")
            throw new Error(`${bucketName} bucket perform cluster.openBucket error in couchbase-server-database`);
          }
          debug(`${bucketName} bucket connection enstablished`);
          console.log("")
          this._connections[bucketName].operationTimeout = config.operationCustomerTimeout || 15 * 1000;
        });
      }
      this._getDoc[bucketName] = Promise.promisify(this._connections[bucketName].get, {context: this._connections[bucketName]});
      this._upsertDoc[bucketName] = Promise.promisify(this._connections[bucketName].upsert, {context: this._connections[bucketName]});
      this._insertDoc[bucketName] = Promise.promisify(this._connections[bucketName].insert, {context: this._connections[bucketName]});
      this._replaceDoc[bucketName] = Promise.promisify(this._connections[bucketName].replace, {context: this._connections[bucketName]});
      this._removeDoc[bucketName] = Promise.promisify(this._connections[bucketName].remove, {context: this._connections[bucketName]});
      this._getMultiDoc[bucketName] = Promise.promisify(this._connections[bucketName].getMulti, {context: this._connections[bucketName]});
      this._makeQuery[bucketName] = Promise.promisify(this._connections[bucketName].query, {context: this._connections[bucketName]});
    }

    debug('constructing instance of CouchbasePromises class ends');
  }

  // get getDocFrom() {
  //   return this._getDoc;
  // }

  // get upsertDocIn() {
  //   return this._upsertDoc;
  // }

  // get insertDocIn() {
  //   return this._insertDoc;
  // }

  // get replaceDocIn() {
  //   return this._replaceDoc;
  // }

  // get removeDocFrom() {
  //   return this._removeDoc;
  // }

  // get getMultiDocFrom() {
  //   return this._getMultiDoc;
  // }

  // get makeQueryTo() {
  //   return this._makeQuery;
  // }


  getDoc(bucket, docId) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._getDoc[bucket](docId);
  }

  upsertDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._upsertDoc[bucket](docId, newDoc);
  }

  insertDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._insertDoc[bucket](docId, newDoc);
  }

  replaceDoc(bucket, docId, newDoc) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._replaceDoc[bucket](docId, newDoc);
  }

  removeDoc(bucket, docId) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._removeDoc[bucket](docId);
  }

  getMultiDocs(bucket, docId) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._getMultiDoc[bucket](docId);
  }

  makeQuery(bucket, view) {
    if (!this._connections[bucket]) {
      throw new Error(`no bucket connection for ${bucket}`);
    }
    return this._makeQuery[bucket](view);
  }
}
