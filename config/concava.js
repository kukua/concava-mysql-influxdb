import Client from './src/storage/MySQLAndInfluxDB'

export default {
    debug: true,
    port: 3000,
    client: new Client({
		mysql: {
			host: 'mysql',
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASS,
			database: process.env.ON_CREATE_DB,
		},
		influxdb: {
			host: 'influxdb',
			port: 8086,
			protocol: 'http',
			username: process.env.ADMIN_USER,
			password: process.env.INFLUXDB_INIT_PWD,
			database: process.env.PRE_CREATE_DB,
			series: 'SensorData',
		},
        timeout: 5000,
        cacheExpireTime: 15 * 60 * 1000, // 15 minutes
    }),
    payloadMaxSize: '512kb',
}
