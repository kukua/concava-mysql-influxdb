import { auth, metadata } from 'concava-adapter-mysql'
import { storage } from 'concava-adapter-influxdb'

var config = {
	host: 'mysql',
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASS,
	database: process.env.ON_CREATE_DB,
	timeout: 3000, // ms
}

export default {
	debug: true,
	port: 3000,
	payloadMaxSize: '512kb',
	auth: {
		enabled: true,
		header: 'Authorization',
		byToken: true,
		method: auth,
		config,
	},
	metadata: {
		method: metadata,
		config,
	},
	storage: {
		method: storage,
		config: {
			host: 'influxdb',
			port: 8086,
			protocol: 'http',
			username: process.env.ADMIN_USER,
			password: process.env.INFLUXDB_INIT_PWD,
			database: process.env.PRE_CREATE_DB,
			series: 'SensorData',
		},
	},
}
