IMAGE_NAME := goport-landing
CONTAINER_NAME := goport-landing
PORT := 3000

.PHONY: build run install stop clean docker-build docker-run

# Local commands
install:
	cmd /c pnpm install

run:
	cmd /c pnpm dev

build:
	cmd /c pnpm build

# Docker commands
docker-build:
	docker build -t $(IMAGE_NAME) .

docker-run: docker-build
	docker run --rm -d -p $(PORT):3000 --name $(CONTAINER_NAME) $(IMAGE_NAME)
	@echo Landing page running at http://localhost:$(PORT)

docker-stop:
	docker stop $(CONTAINER_NAME)

docker-clean: docker-stop
	docker rmi $(IMAGE_NAME)
