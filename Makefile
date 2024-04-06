COMPOSE_FILE=docker-compose.yml
DOCKER_COMPOSE=docker-compose -f $(COMPOSE_FILE)

default: build

#================================================================================
# Managing the Docker environment (Building and Starting)
#================================================================================
build: ## Build all Docker images
	@echo "Building FE Images"
	@$(DOCKER_COMPOSE) build

start-attached: ## Start the server in attached mode
	@echo "${GREEN}Starting FE in attached mode${RESET}"
	$(DOCKER_COMPOSE) up