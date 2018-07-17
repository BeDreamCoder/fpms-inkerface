INKCHAIN_NETWORK_COMPOSE_FILE="../server/inkchain-samples/artifacts/docker-compose.yaml"
INKCHAIN_NETWORK="docker-compose-network.yaml"
MYSQL_COMPOSE_FILE="docker-compose-mysql.yaml"
EXPLORE_COMPOSE_FILE="docker-compose-explorer.yaml"
SERVER_COMPOSE_FILE="docker-compose-server.yaml"

all:
	@echo "Begin start docker service"
	make setup-network
	make setup-mysql
	make setup-server
	make setup-explorer

setup-network:
	@echo "Begin start inkchain network"
	docker-compose -f ${INKCHAIN_NETWORK} up -d

setup-mysql:
	@echo "Begin start mysql"
	docker-compose -f ${MYSQL_COMPOSE_FILE} up -d

setup-server:
	@echo "Begin start server"
	docker-compose -f ${SERVER_COMPOSE_FILE} up -d

setup-explorer:
	@echo "Begin start explorer"
	docker-compose -f ${EXPLORE_COMPOSE_FILE} up -d

stop-network:
	@echo "Stop  docker service"
	docker-compose -f ${INKCHAIN_NETWORK} down

stop-mysql:
	@echo "Stop mysql service"
	docker-compose -f ${MYSQL_COMPOSE_FILE} down

stop-server:
	@echo "Stop server service"
	docker-compose -f ${SERVER_COMPOSE_FILE} down

stop-explorer:
	@echo "Stop explorer service"
	docker-compose -f ${EXPLORE_COMPOSE_FILE} down

network-logs:
	docker-compose -f ${INKCHAIN_NETWORK} logs -f --tail=1000

mysql-logs:
	docker-compose -f ${MYSQL_COMPOSE_FILE} logs -f --tail=1000

server-logs:
	docker-compose -f ${SERVER_COMPOSE_FILE} logs -f --tail=1000

explorer-logs:
	docker-compose -f ${EXPLORE_COMPOSE_FILE} logs -f --tail=1000
