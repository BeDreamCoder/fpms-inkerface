FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive
ADD conf/sources.list /etc/apt/sources.list
RUN apt-get update \
    && apt-get install -y nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && echo "daemon off;" >> /etc/nginx/nginx.conf

RUN mkdir /www
COPY explore/ /www
WORKDIR /www

EXPOSE 80
CMD ["nginx"]