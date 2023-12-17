# VOLUMES_PATH = ~/ft-transcendence/volumes

all: up

up:
	@docker compose up -d --build
#	@(cd /apps/backend/backend/database && npx prisma migrate dev && npx prisma studio)

down:
	@docker compose down
	-@docker image rm -f $$(docker images -q)
	-@docker volume rm $$(docker volume ls -q)

# volume:
#  @mkdir -p $(VOLUMES_PATH)/postgresql/data $(VOLUMES_PATH)/uploads $(VOLUMES_PATH)/migrations

clean: down
#	@rm -rf $(VOLUMES_PATH)/postgresql
#	@rm -rf $(VOLUMES_PATH)/uploads
#	 @rm -rf $(VOLUMES_PATH)/migrations
	@docker system prune --all --force

re: down up
