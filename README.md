# ConCaVa with MySQL and InfluxDB

> This setup uses MySQL for authentication and sensor metadata and InfluxDB for measurement storage.

## Requirements

- [Docker](https://docs.docker.com/engine/installation/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## How to use

```bash
git clone https://github.com/kukua/concava-mysql-influxdb
cd concava-mysql-influxdb
cp .env.sample .env
# > Edit configuration in .env
docker-compose up -d
```

The MySQL database is migrated with `tools/database.sql`.

## Test

```bash
http PUT 'http://<container IP>:3000/v1/sensorData/0000000000000001' \
	'Authorization: Token abcdef0123456789abcdef0123456789' 'Content-Type: application/octet-stream' \
	< tools/payload.data
```

In these examples [HTTPie](https://github.com/jkbrzt/httpie) is used.
