## Building docker image

1. Clone git repository
2. Install node and docker
3. Run `npm install package.json` to install dependencies
4. Run `docker build . -t memes-api` to create Dockerimage

## Running docker image

1. Build docker image
2. Run `docker run -p 3000:3000 memes-api`
3. Access through `127.0.0.1:3000` 