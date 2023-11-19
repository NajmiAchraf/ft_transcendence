all: up

up:
	@docker compose up -d --build
	@(cd database && npx prisma migrate dev && npx prisma studio)

down:
	@docker compose down
	@docker image rm -f $$(docker images -q)
	@docker volume rm $$(docker volume ls -q)
	# @docker system prune --all --force

re: down up