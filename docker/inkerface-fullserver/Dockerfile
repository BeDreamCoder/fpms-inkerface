FROM ubuntu:16.04
ENV DEBIAN_FRONTEND noninteractive
ADD conf/sources.list /etc/apt/sources.list
RUN mkdir /work
WORKDIR /work
RUN apt-get update
RUN apt-get install -y g++ gcc build-essential curl gettext
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN apt-get update
RUN apt-get install -y nodejs
RUN npm config set registry https://registry.npm.taobao.org
COPY ./server /work/
COPY ./public /work/public
COPY ./config /work/config
RUN mkdir -p /tmp/inkchain-client-kvs_peerOrg1
RUN npm install
VOLUME /work/config/artifacts
VOLUME /tmp/inkchain-client-kvs_peerOrg1
EXPOSE 8081
#CMD envsubst < /work/config.js > /work/config.js && node index.js
CMD node index.js
