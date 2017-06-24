'use strict';

const couchbase = require('couchbase');
const Promise = require('bluebird');
const debug = require('debug')('couchbase-server-database');

module.exports = class CouchbaseDatabase {
  constructor(config) {
    debug('start constructing instance of CouchbaseDatabase class');
    console.log("config", config)
    console.log("typeof config", typeof config)
    console.log("config.cluster", config.cluster)

    if (typeof config === 'object' && config.cluster) {
      this._cluster = new couchbase.Cluster(config.cluster);
    } else {
      throw new Error('Couchbase connection string not supplied to Database');
    }

    this._connections = {};

    const bucketArray = config.buckets || [];
    console.log("bucketArray", bucketArray)
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
    this._getDoc = {};

    for (let i = 0; i < bucketArray.length; i++) {
      console.log("bucketArray[i]", bucketArray[i])

      const newBucket = bucketArray[i];
      const bucketName = Object.keys(bucketArray[i]);

      console.log("bucketName", bucketName)


      console.log(Object.keys(bucketArray[i]))
      const x = bucketArray[i];
      if (!this._connections.bucketArray || !this._connections.bucketArray[i]) {
        console.log("111dsadsadas bucket", newBucket[bucketName].bucket)
        console.log("111dsadsadas pass", newBucket[bucketName].password)
        this._connections[bucketName] = this._cluster.openBucket(newBucket[bucketName].bucket, newBucket[bucketName].password, function(err) {
          console.log("mesa edo")
          if (err) {
            throw new Error(`${bucketName} bucket perform cluster.openBucket error in couchbase-server-database`);
          }
          debug(`${bucketName} bucket connection enstablished`);

          //this._connections[bucketName].operationTimeout = config.operationCustomerTimeout || 15 * 1000;
        });
      }
      console.log("zzzzzzz")

      this._getDoc[bucketName] = Promise.promisify(this._connections[bucketName].get, {context: this._connections[bucketName]});

    }



    //this._getDoc[bucketArray[i]] = Promise.promisify(this._connections.bucketArray[i].get, {context: this._connections.bucketArray[i]});

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


  get getFrom() {
    console.log("asdasd", this._getDoc)
    return this._getDoc
    // console.log("bucketName", bucketName)
    // console.log("this._connections", this._connections)
    // if (!this._connections[bucketName]) {
    //   throw new Error(`no bucket connection for ${bucketName}`);
    // }
    // return Promise.promisify(this._connections[bucketName].get, {context: this._connections[bucketName]});
  }


  // get getDoc() {
  //   return Object.freeze({
  //     get: this.getData,
  //     upsert: this.upsertData,
  //     insert: this.insertData,
  //     replace: this.replaceData,
  //     delete: this.removeData
  //   });
  // }


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
