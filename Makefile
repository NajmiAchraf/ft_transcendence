all: up

up: volume
	@docker compose up -d --build
#	@(cd /apps/backend/backend/database && npx prisma migrate dev && npx prisma studio)

down:
	@docker compose down
	@docker image rm -f $$(docker images -q)
	@docker volume rm $$(docker volume ls -q)

volume:
	@mkdir -p ./volumes/postgresql/data ./volumes/uploads ./volumes/migrations

clean:
	@rm -rf ./volume/postgresql/data
	@rm -rf ./volumes/uploads
	@rm -rf ./volumes/migrations
	@docker system prune --all --force

re: down up
