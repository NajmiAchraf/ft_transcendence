all: build_up

build_up:
	@docker compose up -d --build

up: down build_up
	
down:
	@docker compose down

clean: down
	-@docker compose down --rmi all

re: clean all

clear: clean
	-@docker rm -f $$(docker rm -q)
	-@docker rmi -f $$(docker images -q -a)

prune: clear
	@docker system prune --all --force

backendlogs:
	@docker logs backend

frontlogs:
	@docker logs frontend

postlogs:
	@docker logs postgresql