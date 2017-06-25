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


var x = new CouchbaseDatabase(couchbase);
x.getDoc('customers', 'campaign:dimoslocaldbauth0:dimoslocaldbauth0:tracking')
.then(doc => {
  console.log("doc", doc)
  return x.getDoc('data', 'campaign:dimoslocaldbauth0:dimoslocaldbauth0:tracking')
})
.then(doc => {
  console.log("doc111", doc)
})
.catch(error => {
  console.log("error", error)
})

//module.exports = require('./lib');
