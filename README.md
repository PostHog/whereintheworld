# WITW

> 🚧 This app is still in alpha development and we don't recommend using it yet.

## Development server

The code for the server is located in the [`backend`](./backend) directory.

### 1. Install dependencies

1. Install [Postgres.app](https://postgresapp.com/) and follow the [instructions](https://postgresapp.com/documentation/install.html) to add it to your path.

2. Set a `virtualenv` (optional)

3. Install the OS & pip dependencies.
```
# On MacOS with brew
brew install gdal libgeoip

# On Ubuntu
sudo add-apt-repository ppa:ubuntugis/ppa
sudo apt-get update
sudo apt-get install libgeoip-dev libgdal-dev gdal-bin
sudo apt-get install postgresql-12-postgis-3

# On everything
pip install -r requirements-test.txt
pip install -r requirements.txt
```

**Running on M1**
To run successfully on M1, set the following env vars
```
export GDAL_LIBRARY_PATH=/opt/homebrew/lib/libgdal.dylib
export GEOS_LIBRARY_PATH=/opt/homebrew/lib/libgeos_c.dylib
```

### 2. Create database and start backend

```
psql
CREATE DATABASE whereintheworld;
CREATE USER whereintheworld WITH PASSWORD 'whereintheworld';
ALTER ROLE whereintheworld SUPERUSER;
```

**Migrate the database

```
python manage.py migrate
python manage.py cities --import=all
```


### 3. Get Google Oauth configs

https://console.cloud.google.com/apis/credentials



### 3. Start the app

The code for the frontend is located in the [`src`](./src) directory. You can start the entire app (frontend & backend) as follows:

```
yarn
./bin/start
```
The server is now running at [`http://localhost:8000/`](http://localhost:8000/). **Warning:** Don't visit `localhost:3000` as the raw frontend will not work as expected.

## Docker Build and Delivery

### 1. Create a Docker Hub Repo
[Visit Dockerhub](https://hub.docker.com/) and create a repository for the image
If you don't have a Dockerhub account setup, follow the [Docker Hub Quick Start Guide](https://docs.docker.com/docker-hub/) then return here.

### 2. Authenticate To Docker Hub
Run `docker login` and follow the prompts

### 3. Build and Deliver
After you've authenticated successfully build, tag, and push the image to docker hub
subtitute the values in `<>` in the command below with your actual parameters

*Please Note:* For the purposes of this excersize we are using a floating `latest` tag.
In any other scenario we would want to consider a more robust tagging strategy, using git commit hashses, sementatic versioning, or both to more explicitly
identify the version of the application built in the container.

```bash
docker build . -t <your-dockerhub-username>/<your-repo-name>:latest
docker push <your-dockerhub-username>/<your-repo-name>:latest
```