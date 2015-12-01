import mysql from 'mysql'
import waterfall from 'async-waterfall'
import map from 'map-async'
import influx from 'influx'
import Adapter from './Adapter'
import SensorData from '../SensorData'
import SensorAttribute from '../SensorAttribute'

export default class Client extends Adapter {
	constructor (config) {
		super(config)
		this._mysql = mysql.createConnection(this.getConfig().mysql)
		this._influxdb = influx(this.getConfig().influxdb)
		this._cache = {}
	}
	getMySQLClient () {
		return this._mysql
	}
	getInfluxDBClient () {
		return this._influxdb
	}
	_authenticate (authToken, cb) {
		this.getMySQLClient().query({
			sql: this._createQuery(authToken),
			timeout: this.getConfig().timeout,
			values: [authToken],
		}, (err, rows) => {
			if (err) return cb(err)
			if ( ! rows[0]) return cb('No user for token.')
			cb(null, rows[0])
		})
	}
	_createQuery (authToken) {
		var query = this.getConfig().mysql.authQuery

		if ( ! query) {
			query = `
				SELECT users.* FROM users
				INNER JOIN user_tokens ON user_tokens.user_id = users.id
				WHERE user_tokens.token = ?
				LIMIT 1
			`
		}

		return query
	}
	setSensorMetadata (authToken, data, cb) {
		if ( ! (data instanceof SensorData)) return cb('Invalid SensorData given.')

		var id = data.getDeviceId()

		// Check cache
		var cached = this._cache[id]

		if (cached && cached.timestamp > Date.now() - this.getConfig().cacheExpireTime) {
			data.setAttributes(cached.attributes)
			return cb()
		}

		// Query metadata
		this._authenticate(authToken, (err, user) => {
			if (err) return cb(err)

			waterfall([
				(cb) => { cb(null, data.getDeviceId()) },
				this._getAttributes.bind(this),
				this._setConverters.bind(this),
				this._setCalibrators.bind(this),
				this._setValidators.bind(this),
				(attributes, cb) => { cb(null, attributes.map((attr) => attr.instance)) },
			], (err, attributes) => {
				if (err) return cb(err)

				// Cache result
				this._cache[id] = { attributes, timestamp: Date.now() }

				// Callback
				data.setAttributes(attributes)
				cb()
			})
		})
	}
	_getAttributes (deviceId, cb) {
		this.getMySQLClient().query({
			sql: 'SELECT * FROM attributes WHERE device_id = ? ORDER BY `order`',
			timeout: this.getConfig().timeout,
			values: [deviceId],
		}, (err, rows) => {
			if (err) return cb(err)

			cb(null, rows.map((row) => ({
				id: row.id,
				instance: new SensorAttribute(row.name),
			})))
		})
	}
	_setConverters(attributes, cb) {
		map(attributes, (attr, cb) => {
			this.getMySQLClient().query({
				sql: 'SELECT type, value FROM converters WHERE attribute_id = ? ORDER BY `order`',
				timeout: this.getConfig().timeout,
				values: [attr.id],
			}, (err, rows) => {
				if (err) return cb(err)

				rows.forEach((row) => {
					attr.instance.addConverter(row.type, row.value)
				})
				cb(null, attr)
			})
		}, cb)
	}
	_setCalibrators(attributes, cb) {
		map(attributes, (attr, cb) => {
			this.getMySQLClient().query({
				sql: 'SELECT fn FROM calibrators WHERE attribute_id = ? ORDER BY `order`',
				timeout: this.getConfig().timeout,
				values: [attr.id],
			}, (err, rows) => {
				if (err) return cb(err)

				rows.forEach((row) => {
					attr.instance.addCalibrator(new Function('value', row.fn))
				})
				cb(null, attr)
			})
		}, cb)
	}
	_setValidators(attributes, cb) {
		map(attributes, (attr, cb) => {
			this.getMySQLClient().query({
				sql: 'SELECT type, value FROM validators WHERE attribute_id = ? ORDER BY `order`',
				timeout: this.getConfig().timeout,
				values: [attr.id],
			}, (err, rows) => {
				if (err) return cb(err)

				rows.forEach((row) => {
					attr.instance.addValidator(row.type, row.value)
				})
				cb(null, attr)
			})
		}, cb)
	}
	insertSensorData (authToken, data, fallbackDate, cb) {
		if ( ! (data instanceof SensorData)) return cb('Invalid SensorData given.')

		this._authenticate(authToken, (err, user) => {
			if (err) return cb(err)

			var series = this.getConfig().influxdb.series
			var point = data.getData()

			// Determine timestamp
			var timestamp = point.timestamp
			if ( ! timestamp) timestamp = fallbackDate
			timestamp = (new Date(timestamp).getTime() || Date.now()) * 1000000
			// Specify time in nanoseconds (https://goo.gl/s60Lhy)

			point.time = timestamp
			delete point.timestamp

			// Determine tags
			var tags = { deviceId: data.getDeviceId() }

			// Write point
			this.getInfluxDBClient().writePoint(series, point, tags, {}, cb)
		})
	}
}
