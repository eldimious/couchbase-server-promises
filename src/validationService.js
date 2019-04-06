function validateConfiguration(config) {
  if (!config
    || !config.cluster
    || !config.user
    || !config.password
    || !config.buckets) {
    throw new Error('Couchbase connection string not supplied to Database. Take a look at github example to see the correct config.');
  }
  if (!Array.isArray(config.buckets)
    || config.buckets.length <= 0) {
    throw new Error('You should add bucket in buckets in config. Take a look at github example to see the correct config.');
  }
  return;
}

module.exports = {
  validateConfiguration,
};
