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
    },
    {
      bucket: 'stats',
    }, 
    {
      bucket: 'users'
    }
  ],
  user: 'testUser',
  password: 'testPassword',
};
```

as `buckets` we add all couchbase's bucket(name&password(password is not required)), that we have in our cluster. Also you can specify multiple hosts(clusters) in the connection string(cluster's array in config). To specify multiple hosts, separate them using a comma, for example: `cluster: [couchbase://127.0.0.1:8091,couchbase://127.0.0.1:8092]`. Also, you can specify `operationTimeout` for each bucket(not required).

Then, reference it in your code file:

```javascript
const couchbasePromisesWrapper = require('couchbase-server-promises')(config);
```

Use the methods of the `couchbasePromisesWrapper` class to manage documents stored in your Couchbase database directly by their document identifiers:

## Exported Methods:

- `getDoc(bucket, docId)`
- `upsertDoc(bucket, docId, newDoc)`
- `insertDoc(bucket, docId, newDoc)`
- `replaceDoc(bucket, docId, newDoc)`
- `removeDoc(bucket, docId)`
- `getMultiDocs(bucket, [ docIds ])`
- `query(bucket, query)`
- `getBucketManager(bucket)`: Returns **bucket.manager**
- `getConnectedBuckets()`: Returns array of connected buckets
- `disconnectBucket(bucket)`: Disconnects from bucket

where:
`bucket`: is the name of bucket we want to manage doc, 
`docId`: is the doc's name we want to manage,
`newDoc`: is the doc's struct that we want to store in `docId`

## Example

1) **Get doc** with name `user:test` from `customers` bucket:

```JavaScript
try {
  const doc = await couchbasePromisesWrapper.getDoc('customers', 'user:test');
  /*code*/
} catch(error) {
  /*code*/
}
```

2) **Get doc** with name `statistics:test` from `stats` bucket:

```JavaScript
try {
  const doc = await couchbasePromisesWrapper.getDoc('stats', 'statistics:test');
  /*code*/
} catch(error) {
  /*code*/
}
```

3) Update doc with name `statistics:test` from `stats` bucket with a new object called `newTestValue`:

```JavaScript
try {
  const doc = await couchbasePromisesWrapper.upsertDoc('stats', 'statistics:test', newTestValue)
  /*code*/
} catch(error) {
  /*code*/
};
```
4) Remove doc with name `statistics:test` from `stats` bucket:

```JavaScript
try {
  const doc = await couchbasePromisesWrapper.removeDoc('stats', 'statistics:test')
  /*code*/
} catch(error) {
  /*code*/
};
```

5) Replace doc with name `statistics:test` from `stats` bucket with a new object called `newTestValue`:

```JavaScript
try {
  const doc = await couchbasePromisesWrapper.replaceDoc('stats', 'statistics:test', newTestValue)
  /*code*/
} catch(error) {
  /*code*/
};
```

6) Add new doc with name `statistics:test` in `stats` bucket with value: `newTestValue`:

```JavaScript
try {
  const doc = await couchbasePromisesWrapper.insertDoc('stats', 'statistics:test', newTestValue)
  /*code*/
} catch(error) {
  /*code*/
};
```

7) Get list of docs(multi) with name `statistics:test1`, `statistics:test2` and `statistics:test3`:

```JavaScript
try {
  const docs = await couchbasePromisesWrapper.getMultiDocs('stats', [
    'statistics:test1',
    'statistics:test2',
    'statistics:test3',
  ])
  /*code*/
} catch(error) {
  /*code*/
};
```


9) Make query to `stats` bucket using a `view`:

```JavaScript
const view = couchbasePromisesWrapper.ViewQuery
  .from('testView', 'test')
  .range(startkey, endkey)
  .order(order)
  .reduce(false)
  .limit(24)
  .skip(10);
  
couchbasePromisesWrapper.query('stats', view)
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```

8) Make query to `stats` bucket using a `N1qlQuery`:

```JavaScript
const sqlQuery = couchbasePromisesWrapper.N1qlQuery.fromString(`
  SELECT * FROM \`stats\`
  WHERE type = "test";
`);
  
couchbasePromisesWrapper.query('stats', sqlQuery)
.then(doc => {
  /*code*/
})
.catch(error => {
  /*code*/
});
```
