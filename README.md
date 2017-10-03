# couchbase-server-promises

> A promise-based asynchronous library for Couchbase and node.js.

The [Official Couchbase Node.js Client Library](https://www.npmjs.com/package/couchbase) provides only callback functions to handle the result of the asynchronous operations. This `couchbase-server-promises` library wraps those callback functions with [Bluebird](https://www.npmjs.com/package/bluebird) promises to provide a convenient, promise-based interface.

## Usage

First, install `couchbase-server-promises` as a dependency:

```shell
npm install --save couchbase-server-promises
```

In order to init it, you should use a config. The config should have a structure like this:

```javascript
const config = {
  cluster: [ 'couchbase://127.0.0.1:8091' ],
  buckets: [
    {
      bucket: 'customers',
      password: '123',
      operationTimeout: 1500
    },
    {
      bucket: 'stats',
      password: '123'
    }, 
    {
      bucket: 'users'
    }
  ]
};
```
as `buckets` we add all couchbase's bucket(name&password(password is not required)), that we have in our cluster. Also you can specify multiple hosts(clusters) in the connection string(cluster's array in config). To specify multiple hosts, separate them using a comma, for example: `cluster: [couchbase://127.0.0.1:8091,couchbase://127.0.0.1:8092]`. Also, you can specify `operationTimeout` for each bucket(not required).

Then, reference it in your code file:

```javascript
const couchbasePromisesWrapper = require('couchbase-server-promises')(config);
```

Use the methods of the `couchbasePromisesWrapper` class to manage documents stored in your Couchbase database directly by their document identifiers:
- `getDoc(bucket, docId)`
- `upsertDoc(bucket, docId, newDoc)`
- `insertDoc(bucket, docId, newDoc)`
- `replaceDoc(bucket, docId, newDoc)`
- `removeDoc(bucket, docId)`
- `getMultiDocs(bucket, docId)`

You can get `bucket.manager` from each bucket using: `getBucketManager(bucket)`.

Also you can get all connected buckets in the cluster using: `getConnectedBuckets()`. It returns an array that includes all the buckets, that are connected.

where:
`bucket`: is the name of bucket we want to manage doc, 
`docId`: is the doc's name we want to manage,
`newDoc`: is the doc's struct that we want to store in `docId`


## Example

1) Get doc with name `user:test` from `customers` bucket:

```JavaScript
couchbasePromisesWrapper.getDoc('customers', 'user:test')
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

2) Get doc with name `statistics:test` from `stats` bucket:

```JavaScript
couchbasePromisesWrapper.getDoc('stats', 'statistics:test')
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

3) Make query to `stats` bucket:

```JavaScript
let view = couchbasePromisesWrapper.ViewQuery
  .from('testView', 'test')
  .range(startkey, endkey)
  .order(order)
  .reduce(false)
  .limit(24)
  .skip(10);
  
couchbasePromisesWrapper.makeQuery('stats', view)
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

4) Update doc with name `statistics:test` from `stats` bucket with a new object called `newTestValue`:

```JavaScript
couchbasePromisesWrapper.upsertDoc('stats', 'statistics:test', newTestValue)
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

5) Remove doc with name `statistics:test` from `stats` bucket:

```JavaScript
couchbasePromisesWrapper.removeDoc('stats', 'statistics:test')
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
