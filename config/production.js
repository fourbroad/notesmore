const config = {
  elasticSearch: {
    host: 'es-cn-mp9136c4d000f4mll.elasticSearch.aliyuncs.com:9200',
    apiVersion: '6.3',
    requestTimeout: 120000
  },
  hdfs: {
    user: 'root',
    host: 'localhost',
    port: 9870
  },
  redis: {
    host:'172.16.0.30'
  }
};

module.exports = config;
