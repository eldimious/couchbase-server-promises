'use strict';

const async = require('async');
const couchbase = require('couchbase');
const Promise = require('bluebird');
const errors = require('../common/errors');
const debug = require('debug')('socius-tools-database');

module.exports = class CouchbaseDatabase {
  constructor(config) {
    debug('constructing instance of Database class in socius-tools');
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
            throw new Error(`${bucketArray[i]} bucket perform cluster.openBucket error in socius-tools`);
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
    //       throw new Error('customer bucket perform cluster.openBucket error in socius-tools');
    //     }
    //   });
    //   debug('customers bucket connection enstablished');
    //   this.customerBucket.operationTimeout = config.operationCustomerTimeout || 15 * 1000;
    // }

    // if (!this.dataBucket) {
    //   this.dataBucket = cluster.openBucket(dataBucketID, dataBucketPW, function(err) {
    //     if (err) {
    //       throw new Error('data bucket perform cluster.openBucket error in socius-tools');
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

    //Returns all customer's tokens.
    this.getCustomerToken = (customer) => new Promise((resolve, reject) => {    
      const startkey = customer ? [customer] : [];
      const endkey =  customer ? [customer, {}] : [{}];
      const view = couchbase.ViewQuery
        .from('customers', 'tokens')
        .range(startkey, endkey)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false);

      this.customerBucket.query(view, (error, tokens, meta) => {
        if (error) {
          return reject(error);
        } else if (tokens.length <= 0) {
          return resolve({});
        }
        // Return an object that holds the count of tokens for each service
        tokens = tokens.reduce((response, item) => {
          response[item.key[1]] = response[item.key[1]] + 1 || 1;
          return response;
        }, {});
        return resolve(tokens); 
      });
    });


    //Returns all customer's of a specific service.
    this.getCustomerServiceToken = (service, customer) => new Promise((resolve, reject) => {
      const startkey = (service && customer) ? [service, customer] : ((service && !customer) ? [service] : []);
      const endkey = (service && customer) ? [service, customer, {}] : ((service && !customer) ? [service, {}] : [{}]);

      const view = couchbase.ViewQuery
        .from('users', 'tokens')
        .range(startkey, endkey)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false);

      this.customerBucket.query(view, (error, result, meta) => {
        if (error) {
          const errorMessage = error && error.message ? error.message : `${service} get tokens error`;
          return reject(new errors.not_found(errorMessage));
        } else if(result.length <= 0) {
          return resolve([]);
        }
        return resolve(result);
      });
    });


    //Returns all backup token for service.
    this.getBackUpToken = (service) => new Promise((resolve, reject) => {
      const startkey = service ? [service] : [];
      const endkey =  service ? [service, {}] : [{}];
      const view = couchbase.ViewQuery
        .from('users', 'backup-tokens')
        .range(startkey, endkey)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false);

      this.customerBucket.query(view, (error, result, meta) => {
        if (error) {
          const errorMessage = error && error.message ? error.message : `${service} get backup-tokens error`;
          return reject(new errors.not_found(errorMessage));
        } else if(result.length <= 0) {
          return resolve([]);
        }
        return resolve(result);
      });
    });


    this.getTrackables = (service, type) => new Promise((resolve, reject) => {
      const startkey = (service && type) ? [service, type] : ((service && !type) ? [service] : []);
      const endkey = (service && type) ? [service, type, {}] : ((service && !type) ? [service, {}] : [{}]);
      const view = couchbase.ViewQuery
        .from('campaigns', 'trackables')
        .range(startkey, endkey)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false);

      this.customerBucket.query(view, (error, result, meta) => {
        if (error) {
          const errorMessage = error && error.message ? error.message : `${service} get trackables error`;
          return reject(new errors.not_found(errorMessage));
        } else if(result.length <= 0) {
          return resolve([]);
        }
        return resolve(result);
      });
    });


    //Returns media with options for filtering.
    this.getMedia = (options) => new Promise((resolve, reject) => {
      var startkey = [options.campaign_id, options.customer, options.status || null, options.source || null, null];
      var endkey =  [options.campaign_id, options.customer, options.status || {}, options.source || {}, {}];
      var view = couchbase.ViewQuery
        .from('media', 'source')
        .range(startkey, endkey)
        .order(options.order)
        .stale(couchbase.ViewQuery.Update.AFTER)
        .reduce(false)
        .limit(parseInt(options.limit, 10))
        .skip(parseInt(options.skip, 10));

      // Use pending view and keys if no status

      // Use keyword view if asking for keywords
      if (options.keyword && options.source) {
        view.from('keywords', 'media-source')
        startkey = [options.campaign_id, options.customer, options.keyword, options.status, options.source, null];
        endkey =  [options.campaign_id, options.customer, options.keyword, options.status, options.source, {}];
      } else if (options.keyword) {
        view.from('keywords', 'media')
        startkey = [options.campaign_id, options.customer, options.keyword, options.status, null];
        endkey =  [options.campaign_id, options.customer, options.keyword, options.status, {}];
      } else if (options.username && options.source) {
        options.username = options.username.toLowerCase();
        view.from('media', 'username-source')
        startkey = [options.campaign_id, options.customer, options.username, options.source, options.status, null];
        endkey =  [options.campaign_id, options.customer, options.username, options.source, options.status, {}];
      } else if (options.username) {
        options.username = options.username.toLowerCase();
        view.from('media', 'username')
        startkey = [options.campaign_id, options.customer, options.username, options.status, null];
        endkey =  [options.campaign_id, options.customer, options.username, options.status, {}];
      } else if (options.source) {
        view.from('media', 'source')
        startkey = [options.campaign_id, options.customer, options.status, options.source];
        endkey =  [options.campaign_id, options.customer, options.status, options.source, {}];
      } else if (options.status) {
        view
        .from('media', 'status')
        .stale(couchbase.ViewQuery.Update.BEFORE)
        startkey = [options.campaign_id, options.customer, options.status];
        endkey =  [options.campaign_id, options.customer, options.status, {}];
      } else if (options.status === undefined) {
        view
        .from('media', 'pending')
        .stale(couchbase.ViewQuery.Update.BEFORE)
        startkey = [options.campaign_id, options.customer];
        endkey =  [options.campaign_id, options.customer, {}];
      }

      // Reverse range if order is descending
      if (options.order === 2) {
        view.range(endkey, startkey)
      }
      
      this.dataBucket.query(view, (error, result, meta) => {
        if (error) {
          return reject(error);
        } else if (result.length <= 0) {
          return resolve([]);
        }
        var ids = result.map(row => row.id);
        return resolve(ids);
      });
    });


    //Returns media stickies.
    this.getMediaStickies = (options) => new Promise((resolve, reject) => {
      var order = options.newest ? 1 : 2;
      var startkey = [options.campaign_id, options.customer];
      var endkey =  [options.campaign_id, options.customer, {}];

      var view = couchbase.ViewQuery
        .from('stickies', 'media')
        .range(startkey, endkey)
        .order(order)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false)
        .limit(parseInt(options.limit, 10))
        .skip(parseInt(options.skip, 10));

      if (order === 2) {
        view.range(endkey, startkey)
      }

      this.dataBucket.query(view, (error, result, meta) => {
        if (error) {
          return reject(error);
        } else if (result.length <= 0) {
          return resolve([]);
        }
        var ids = result.map(row => row.key[1]);
        return resolve(ids);
      });
    });


    //Returns tiles
    this.getTiles = (options) => new Promise((resolve, reject) => {
      var view = couchbase.ViewQuery
        .from('tiles', 'index')
        .range([options.campaign_id, options.customer, {}], [options.campaign_id, options.customer])
        .limit(parseInt(options.limit, 10))
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false)
        .skip(parseInt(options.skip, 10))
        .order(2);

      this.dataBucket.query(view, (error, result, meta) => {
        if (error) {
          return reject(error);
        } else if (result.length <= 0) {
          return resolve([]);
        }
        var ids = result.map(row => row.id);
        return resolve(ids);
      });
    });


    //Returns tiles by keywords
    this.getTilesByKeyword = (options) => new Promise((resolve, reject) => {
      var view = couchbase.ViewQuery
        .from('keywords', 'tiles')
        .range([options.campaign_id, options.customer, options.keyword, {}], [options.campaign_id, options.customer, options.keyword])
        .limit(parseInt(options.limit, 10))
        .stale(couchbase.ViewQuery.Update.AFTER)
        .reduce(false)
        .skip(parseInt(options.skip, 10))
        .order(2);

      this.dataBucket.query(view, (error, result, meta) => {
        if (error) {
          return reject(error);
        } else if (result.length <= 0) {
          return resolve([]);
        }
        var ids = result.map(row => row.id);
        return resolve(ids);
      });
    });


    //Returns mediums by username and source
    this.getMediumsByUsernameAndSource = ({campaign_id, customer, username, source}) => new Promise((resolve, reject) => {
      let startRange;
      let endRange;

      username = username.toLowerCase();

      if (!campaign_id) {
        return reject(`Need campaign_id for query`);
      }
      if (!username) {
        return reject(`Need username for query`);
      }
      if (!customer) {
        return reject(`Need customer for query`);
      }

      if (campaign_id && customer && username && source) {
        startRange = [campaign_id, customer, username, source];
        endRange = [campaign_id, customer, username, source, {}];
      } else if (campaign_id && customer && username && !source) {
        startRange = [campaign_id, customer, username];
        endRange = [campaign_id, customer, username, {}];
      } else {
        startRange = [];
        endRange = [{}];
      }

      const view = couchbase.ViewQuery
        .from('media', 'username-source')
        .range(startRange, endRange)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false);

      this.dataBucket.query(view, (error, result, meta) => {
        if (error) {
          return reject(`Error: in view query get mediums by username.`);
        } else if (result.length === 0) {
          return resolve([]);
        }
        const mediumsIdToDelete = result.map(medium => ({
          id: medium.id
        }));
        return resolve(mediumsIdToDelete);
      });
    })
    .catch(error => {
      if (error === `Need username for query` || error === `Need campaign_id for query` || error === `Need customer for query`) {
        throw new errors.invalid_argument(error);
      } else {
        const errorMessage = error && error.message ? error.message : 'Error in query mediums by username and source.';
        throw new errors.not_found(errorMessage);
      }
    });


    //Returns all mediums by sourceID of all customers OR get all mediums by sourceID by specific customer.
    this.getMediumsBySourceId = (source_id, campaign_id, customer) => new Promise((resolve, reject) => {
      let startRange;
      let endRange;

      if (!source_id) {
        return reject(`Need source_id for query`)
      }
      if (source_id && campaign_id && customer) {
        startRange = [source_id, campaign_id, customer];
        endRange = [source_id, campaign_id, customer, {}];
      } else if (source_id && campaign_id && !customer) {
        startRange = [source_id, campaign_id];
        endRange = [source_id, campaign_id, {}];
      } else if (source_id) {
        startRange = [source_id];
        endRange = [source_id, {}];
      }

      const view = couchbase.ViewQuery
        .from('media', 'source-id')
        .range(startRange, endRange)
        .stale(couchbase.ViewQuery.Update.BEFORE)
        .reduce(false);

      this.dataBucket.query(view, (error, result, meta) => {
        if (error) {
          return reject(error);
        } 
        var mediumsIdToDelete = result.map(medium => medium.id);
        return resolve(mediumsIdToDelete);
      });
    })
    .catch(error => {
      if (error === `Need source_id for query`) {
        throw new errors.invalid_argument(error)
      } else {
        const errorMessage = error && error.message ? error.message : 'Error in query mediums by source id.';
        throw new errors.not_found(errorMessage);
      }
    });

    debug('End of constructing instance of Database class in socius-tools');
  }


  deleteMediumFromDb(medium) {
    return new Promise((resolve, reject) => {
      let tile;
      this.getData(medium.id)
      .then(doc => {
        const newMedium = doc.value;
        newMedium.status = 'deleted';
        newMedium.deleted_reason = medium.deleted_reason || 'deleted using socius-tools';
        tile = newMedium.tile;
        delete newMedium.tile;
        return this.upsertData(medium.id, doc.value)
      })
      .then(success => {
        if (!tile) {
          return resolve();
        }
        return this.removeData(tile).then(success => resolve("medium successfully deleted"))
      })
      .catch(error => {
        return reject('Delete medium from Db error.');
      });
    })
  }


  deleteUsernameMedium({campaign_id, customer, username, source, reason}) {
    return new Promise((resolve, reject) => {
      this.getMediumsByUsernameAndSource({campaign_id, customer, username, source})
      .then(mediumsForDelete => {
        mediumsForDelete.forEach(medium => {
          medium.deleted_reason = reason;
        });
        return Promise.map(mediumsForDelete, medium => this.deleteMediumFromDb(medium));
      })
      .then(success => resolve('all mediums by username deleted.'))
      .catch(error => reject(error));
    });
  }


  changeStatusCampaignDocs({campaign_id, customer, status}) {
    return new Promise((resolve, reject) => {
      const getDocs = [ 
        this.getCustomer(`campaign:${customer}:${campaign_id}`), 
        this.getCustomer(`campaign:${customer}:${campaign_id}:tracking`) 
      ];

      Promise.all(getDocs)
      .then(result => {
        if (!result[0] || !result[0].value) {
          throw new errors.not_found('No campaign doc value found.');
        }
        if (!result[1] || !result[1].value) {
          throw new errors.not_found('No campaign tracking doc value found.');
        }
        result[0].value.status = status;
        result[1].value.status = status;
        const updateDocs = [ 
          this.upsertCustomer(`campaign:${customer}:${campaign_id}`, result[0].value), 
          this.upsertCustomer(`campaign:${customer}:${campaign_id}:tracking`, result[1].value) 
        ];
        return Promise.all(updateDocs);
      })
      .then(result => {
        return resolve('Docs status updated.');
      })
      .catch(error => {
        const errorMessage = error && error.message ? error.message : 'Error in changing status in tracking and main campaign doc.';
        return reject(new errors.not_found(errorMessage));
      });
    });
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


  get views() {
    return Object.freeze({
      customers: {
        getCustomerServiceToken: this.getCustomerServiceToken,
        getCustomerToken: this.getCustomerToken,
        getBackUpToken: this.getBackUpToken,
        getTrackables: this.getTrackables
      },
      data: {
        getTilesByKeyword: this.getTilesByKeyword,
        getTiles: this.getTiles,
        getMediaStickies: this.getMediaStickies,
        getMedia: this.getMedia,
        getMediumsBySourceId: this.getMediumsBySourceId,
        getMediumsByUsernameAndSource: this.getMediumsByUsernameAndSource
      }
    });
  }
}
