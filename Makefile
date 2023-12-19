all: build_up

build_up:
	@docker compose up -d --build

up: down build_up
	
down:
	@docker compose down

clean: down
	-@docker compose down --rmi all

re: clean all

prune: clean
	@docker system prune --all --force

backendlogs:
	@docker logs backend

frontlogs:
	@docker logs frontend

postlogs:
	@docker logs postgresql