update_env:
	./update_env.sh -f .env

lint:
	npm run lint

run:
	npm run dev

build:
	npm run build

clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf .vite

.PHONY: lint clean run build
