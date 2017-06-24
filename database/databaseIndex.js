'use strict';

const couchbase = require('couchbase');
const Promise = require('bluebird');
const debug = require('debug')('couchbase-server-database');

module.exports = class CouchbaseDatabase {
  constructor(config) {
    debug('start constructing instance of CouchbaseDatabase class');
  
    if( typeof config === 'object' && typeof config.couchbase === 'object' && typeof !config.couchbase.cluster) {
      this._cluster = new couchbase.Cluster(this._config.couchbase.cluster);
    } else {
      throw new Error('Couchbase connection string not supplied to Database');
    }

    this._connections = {};

    const bucketArray = config.bucketArray;
    // bucketArray = [
    //   customers: {
    //     bucket: 'customers',
    //     password: 'customers'
    //   },
    //   data: {
    //     bucket: 'data',
    //     password: 'data'
    //   }
    // ]

    if (bucketArray.length <= 0) {
      throw new Error('You should add bucket in bucketArray in config.');
    }

    this._retunedValues = {};

    for (let i = 0; i < bucketArray.length; i++) {
      console.log("bucketArray[i]", bucketArray[i])
      if (!this.bucketArray[i]) {
        this._connections.bucketArray[i] = cluster.openBucket(bucketArray[i].bucket, bucketArray[i].password, function(err) {
          if (err) {
            throw new Error(`${bucketArray[i]} bucket perform cluster.openBucket error in couchbase-server-database`);
          }
          debug(`${bucketArray[i]} bucket connection enstablished`);
          this._connections.bucketArray[i].operationTimeout = config.operationCustomerTimeout || 15 * 1000;
        });
      }
    }

    // this.getCustomer = Promise.promisify(this.customerBucket.get, {context: this.customerBucket});
    // this.upsertCustomer = Promise.promisify(this.customerBucket.upsert, {context: this.customerBucket});
    // this.insertCustomer = Promise.promisify(this.customerBucket.insert, {context: this.customerBucket});
    // this.replaceCustomer = Promise.promisify(this.customerBucket.replace, {context: this.customerBucket});
    // this.removeCustomer = Promise.promisify(this.customerBucket.remove, {context: this.customerBucket});

    // this.getData = Promise.promisify(this.dataBucket.get, {context: this.dataBucket});
    // this.upsertData = Promise.promisify(this.dataBucket.upsert, {context: this.dataBucket});
    // this.insertData = Promise.promisify(this.dataBucket.insert, {context: this.dataBucket});
    // this.replaceData = Promise.promisify(this.dataBucket.replace, {context: this.dataBucket});
    // this.removeData = Promise.promisify(this.dataBucket.remove, {context: this.dataBucket});
  }


  getDoc(bucketName, documentId) {
    if (!this._connections[bucketName]) {
      throw new Error(`no bucket connection for ${bucketName}`);
    }
    return Promise.promisify(this._connections[bucketName].get, {context: this._connections[bucketName]});
  }




  // get data() {
  //   return Object.freeze({
  //     get: this.getData,
  //     upsert: this.upsertData,
  //     insert: this.insertData,
  //     replace: this.replaceData,
  //     delete: this.removeData
  //   });
  // }


  // get customer()   {
  //   return Object.freeze({
  //     get: this.getCustomer,
  //     upsert: this.upsertCustomer,
  //     insert: this.insertCustomer,
  //     replace: this.replaceCustomer,
  //     delete: this.removeCustomer
  //   });
  // }
}
