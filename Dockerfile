FROM kukuadev/concava:0.4
MAINTAINER Maurits van Mastrigt <maurits@kukua.cc>

RUN npm install concava-adapter-mysql@0.2 concava-adapter-influxdb@0.1
