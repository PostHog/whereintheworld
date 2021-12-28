# #whereintheworld

## Development server

The code for the server is located in the [`backend`](./backend) directory.

### 1. Install dependencies**

1. Install [Postgres.app](https://postgresapp.com/) and follow the [instructions](https://postgresapp.com/documentation/install.html) to add it to your path.

2. Set a `virtualenv` (optional)

3. Install the OS & pip dependencies.
```
brew install gdal libgeoip
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
GRANT ALL PRIVILEGES ON DATABASE whereintheworld TO whereintheworld;
```

**Migrate the database and start the server**

```
python manage.py migrate
python manage.py cities --import=all
python manage.py runserver
```

The server is now running at [`http://localhost:8000/`](http://localhost:8000/).

### 3. Start the frontend

The code for the frontend is located in the [`src`](./src) directory. Once you launched the server, you can start it as follows:

```
yarn
yarn start
```

The app is now running, navigate to [`http://localhost:3000/`](http://localhost:3000/) in your browser to explore its UI.
