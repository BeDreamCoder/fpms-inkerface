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
RUN npm install
EXPOSE 8080
#CMD envsubst < /work/src/config.js > /work/src/config.js && node index.js
CMD node index.js
