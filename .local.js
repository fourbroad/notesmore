const config = {
  elasticSearch: {
    host: 'localhost:9200',
    requestTimeout: 60000
  },
  hdfs: {
    user: 'fourbroad',
    host: 'localhost',
    port: 9870
  },  
  redis: {
    host:'localhost'
  }
};

module.exports = config;
