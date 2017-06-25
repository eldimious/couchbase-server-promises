'use strict';

const CouchbaseDatabase = require('./src');
const couchbase = {
  stale: false,
  cluster: [ 'couchbase://127.0.0.1:8091' ],
  buckets: [
    {
      bucket: 'customers',
      password: 'customers'
    },
    {
      bucket: 'data',
      password: 'data'
    }
  ]
};


var couchbaseUsingPromises = new CouchbaseDatabase(couchbase);

let view;
const order = 1;
const startkey = ["dimoslocaldbauth0", "dimoslocaldbauth0"];
const endkey = ["dimoslocaldbauth0", "dimoslocaldbauth0", {}];

view = couchbaseUsingPromises.ViewQuery
  .from('media', 'sticky')
  .range(startkey, endkey)
  .order(order)
  .reduce(false)
  .limit(24)
  .skip(10);

console.log("view", view)

couchbaseUsingPromises.makeQuery('data', view)
.then(doc => {
  console.log("doc", doc)
  return couchbaseUsingPromises.getDoc('data', 'campaign:dimoslocaldbauth0:dimoslocaldbauth0:tracking')
})
.then(doc => {
  console.log("doc111", doc)
})
.catch(error => {
  console.log("error", error)
})

//module.exports = require('./lib');
