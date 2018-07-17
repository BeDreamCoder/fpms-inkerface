FROM mysql:5.7.21

ENV WORK_PATH /usr/local/work

ENV AUTO_RUN_DIR /docker-entrypoint-initdb.d

ENV FILE_0 explore.sql

ENV FILE_1 init_peer.sql

ENV INSTALL_DATA_SHELL init_db.sh

RUN mkdir -p $WORK_PATH

COPY ./$FILE_0 $WORK_PATH/

COPY ./$FILE_1 $WORK_PATH/

COPY ./$INSTALL_DATA_SHELL $AUTO_RUN_DIR/

EXPOSE 3306

RUN chmod a+x $AUTO_RUN_DIR/$INSTALL_DATA_SHELL
