'use strict';

const couchbase = require('couchbase');
const Promise = require('bluebird');
const debug = require('debug')('couchbase-server-database');

module.exports = class CouchbaseDatabase {
  constructor(config) {
    debug('constructing instance of Database class in');
    const bucketArray = config.bucketArray;
    const cluster = new couchbase.Cluster(config.cluster);
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

    this.retunedValues = {};

    for (let i = 0; i < bucketArray.length; i++) {
      console.log("bucketArray[i]", bucketArray[i])
      if (!this.bucketArray[i]) {
        this.bucketArray[i] = cluster.openBucket(bucketArray[i].bucket, bucketArray[i].password, function(err) {
          if (err) {
            throw new Error(`${bucketArray[i]} bucket perform cluster.openBucket error in couchbase-server-database`);
          }
          debug(`${bucketArray[i]} bucket connection enstablished`);
          this.bucketArray[i].operationTimeout = config.operationCustomerTimeout || 15 * 1000;
          this.retunedValues.getDocFrom = Promise.promisify(this.customerBucket.get, {context: this.customerBucket});
          this.upsertCustomer = Promise.promisify(this.customerBucket.upsert, {context: this.customerBucket});
          this.insertCustomer = Promise.promisify(this.customerBucket.insert, {context: this.customerBucket});
          this.replaceCustomer = Promise.promisify(this.customerBucket.replace, {context: this.customerBucket});
          this.removeCustomer = Promise.promisify(this.customerBucket.remove, {context: this.customerBucket});
        });
      }
    }

    // let customerBucketID = config.customers.bucket;
    // let customerBucketPW = config.customers.password;
    // let dataBucketID = config.data.bucket;
    // let dataBucketPW = config.data.password;
    // let cluster = new couchbase.Cluster(config.cluster);

    // if (!this.customerBucket) {
    //   this.customerBucket = cluster.openBucket(customerBucketID, customerBucketPW, function(err) {
    //     if (err) {
    //       throw new Error('customer bucket perform cluster.openBucket error in ');
    //     }
    //   });
    //   debug('customers bucket connection enstablished');
    //   this.customerBucket.operationTimeout = config.operationCustomerTimeout || 15 * 1000;
    // }

    // if (!this.dataBucket) {
    //   this.dataBucket = cluster.openBucket(dataBucketID, dataBucketPW, function(err) {
    //     if (err) {
    //       throw new Error('data bucket perform cluster.openBucket error in ');
    //     }
    //   });
    //   debug('data bucket connection enstablished');
    //   this.dataBucket.operationTimeout = config.operationDataTimeout || 15 * 1000;
    // }

    this.getCustomer = Promise.promisify(this.customerBucket.get, {context: this.customerBucket});
    this.upsertCustomer = Promise.promisify(this.customerBucket.upsert, {context: this.customerBucket});
    this.insertCustomer = Promise.promisify(this.customerBucket.insert, {context: this.customerBucket});
    this.replaceCustomer = Promise.promisify(this.customerBucket.replace, {context: this.customerBucket});
    this.removeCustomer = Promise.promisify(this.customerBucket.remove, {context: this.customerBucket});

    this.getData = Promise.promisify(this.dataBucket.get, {context: this.dataBucket});
    this.upsertData = Promise.promisify(this.dataBucket.upsert, {context: this.dataBucket});
    this.insertData = Promise.promisify(this.dataBucket.insert, {context: this.dataBucket});
    this.replaceData = Promise.promisify(this.dataBucket.replace, {context: this.dataBucket});
    this.removeData = Promise.promisify(this.dataBucket.remove, {context: this.dataBucket});
  }




  get data() {
    return Object.freeze({
      get: this.getData,
      upsert: this.upsertData,
      insert: this.insertData,
      replace: this.replaceData,
      delete: this.removeData
    });
  }


  get customer()   {
    return Object.freeze({
      get: this.getCustomer,
      upsert: this.upsertCustomer,
      insert: this.insertCustomer,
      replace: this.replaceCustomer,
      delete: this.removeCustomer
    });
  }
}
