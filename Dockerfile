FROM kukuadev/concava:0.2
MAINTAINER Maurits van Mastrigt <maurits@kukua.cc>

WORKDIR /data
COPY src/Client.js src/storage/MySQLAndInfluxDB.js

RUN npm install mysql async-waterfall map-async utils-merge influx@4.0.1
