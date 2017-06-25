# couchbase-server-promises

> A promise-based asynchronous library for Couchbase and node.js.

The [Official Couchbase Node.js Client Library](https://www.npmjs.com/package/couchbase) provides only callback functions to handle the result of the asynchronous operations. This `couchbase-promise` library wraps those callback functions with [Bluebird](https://www.npmjs.com/package/bluebird) promises to provide a convenient, promise-based interface.

## Usage

First, install `couchbase-server-promises` as a dependency:

```shell
npm install --save couchbase-server-promises
```

Then, reference it in your code file:

```javascript
const CouchbaseServerPromises = require('couchbase-server-promises');
```

and init it using a config. The config should have a structure like this:

```javascript
const config = {
  cluster: [ 'couchbase://127.0.0.1:8091' ],
  buckets: [
    {
      bucket: 'customers',
      password: '123'
    },
    {
      bucket: 'stats',
      password: '123'
    }
  ]
};
```
as bucket we add all couchbase's bucket(name+password), that we have in our cluster. And then just init it:

```javascript
const couchbaseServer = new CouchbaseServerPromises(config);
```

Use the methods of the `couchbaseServer` class to manage documents stored in your Couchbase database directly by their document identifiers:
- `getDoc(bucket, docId)`
- `upsertDoc(bucket, docId, newDoc)`
- `insertDoc(bucket, docId, newDoc)`
- `replaceDoc(bucket, docId, newDoc)`
- `removeDoc(bucket, docId)`
- `getMultiDocs(bucket, docId)`

where:
`bucket`: is the name of bucket we want to manage doc, 
`docId`: is the doc's name we want to manage,
`newDoc`: is the doc's struct that we want to store in `docId`


## Example

1) Get doc with name `user:test` from `customers` bucket:

```JavaScript
couchbaseServer.getDoc('customers', 'user:test')
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

2) Get doc with name `statistics:test` from `stats` bucket:

```JavaScript
couchbaseServer.getDoc('stats', 'statistics:test')
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

3) Make query to `stats` bucket:

```JavaScript
let view = couchbaseServer.ViewQuery
  .from('testView', 'test')
  .range(startkey, endkey)
  .order(order)
  .reduce(false)
  .limit(24)
  .skip(10);
  
couchbaseServer.makeQuery('stats', view)
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```
