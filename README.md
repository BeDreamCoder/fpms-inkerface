### 环境准备

1.安装工具

    cd startup
    ./env-setup.sh

2.下载镜像

    ./inkchain-download-images.sh

3.安装项目依赖包

    cd ..
    
    cd client
    npm install

    cd server
    npm install
    
4.启动网络

    cd startup
    docker-compose -f docker-compose-network.yaml up
    
5.启动restful service

    cd ../server
    node index.js
    
6.测试接口

    cd ../client

    node src/createChannel.js
    node src/joinChannel.js
    node src/installChaincode.js
    node src/instantiateChaincode.js
    node src/issueToken.js
    node src/transfer.js

### 测试检查
1.将 config/network-config.json 中的IP地址修改为需要测试的网络地址

2.修改docker-compose-server.yaml、docker-compose-listener.yaml中的 DB_HOST 等配置

3.执行Makefile中的指令启动网络

    // 启动服务
    make setup-network
    make setup-mysql
    make setup-server
    make setup-explorer

    // 查看日志
    make network-logs
    make mysql-logs
    make server-logs
    make explorer-logs

    // 关闭服务
    make stop-network
    make stop-mysql
    make stop-server
    make stop-explorer

### 目录详解

* client: 模拟客户端发起POST/GET请求，测试server
*  docker

```
inkerface-explorer
    只有浏览器相关的api
    cd .
    docker build -t inklabsfoundation/inkerface-explorer:x86_64-0.1.0 .

inkerface-fullserver
    注意：编译镜像需要将public和config目录copy到此目录下
    拥有所有rest api的server
    cd .
    cp -rf ../../config .
    cp -rf ../../public .
    docker build -t inklabsfoundation/inkerface-fullserver:x86_64-0.1.0 .

inkerface-server
    只有调用区块链的api
    注意：编译镜像需要将public和config目录copy到此目录下
    cd .
    cp -rf ../../config .
    cp -rf ../../public .
    docker build -t inklabsfoundation/inkerface-server:x86_64-0.1.0 .

inkerface-xc
    包含跨链在内的全接口
    注意：编译镜像需要将public和config目录copy到此目录下
    cd .
    cp -rf ../../config .
    cp -rf ../../public .
    docker build -t inklabsfoundation/inkerface-sc:x86_64-0.1.0 .
    
inkerface-mysql
    用于浏览器数据缓存
    cd .
    docker build -t inklabsfoundation/inkerface-mysql:x86_64-0.1.0 .

inkerface-listener
    用于区块监听服务
    cd .
    cp -rf ../../config .
    docker build -t inklabsfoundation/inkerface-listener:x86_64-0.1.0 .
```

* server:  network启动的环境和server端测试脚本
* startup: 自动化启动服务脚本


 