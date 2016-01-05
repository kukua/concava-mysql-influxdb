FROM kukuadev/concava:0.2
MAINTAINER Maurits van Mastrigt <maurits@kukua.cc>

WORKDIR /data
COPY src/Client.js src/storage/MySQLAndInfluxDB.js
COPY src/convert.js src/types/convert.js

RUN npm install mysql async-waterfall map-async utils-merge influx@4.0.1
RUN npm install int24
