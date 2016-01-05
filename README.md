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
# 1337 (base 10) = 00000539 (base 16)
echo '00000539' | xxd -r -p | \
    curl -i -XPUT 'http://<container IP>:3000/v1/sensorData/0000000000000001' \
    -H 'Authorization: Token abcdef0123456789abcdef0123456789' \
    -H 'Content-Type: application/octet-stream' --data-binary @-
# > Navigate to http://<container IP>:8083 to login to InfluxDB
# > Authenticate with credentials from .env file
# > Run query "SELECT * FROM SensorData` on the `concava` (configurable with PRE_CREATE_DB) database
```
