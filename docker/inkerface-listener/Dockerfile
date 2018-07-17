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
COPY ./config /work/config
RUN mkdir -p /tmp/inkchain-client-kvs_peerOrg1
RUN npm install
VOLUME /work/config/artifacts
VOLUME /tmp/inkchain-client-kvs_peerOrg1
CMD envsubst < /work/public/inkchain-samples/app/config.js > /work/public/inkchain-samples/app/config.js && node block-listener.js
