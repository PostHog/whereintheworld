# Select Debian distro over alpine due to documented challenges with Postgis on Alpine
# Could solve w/ more time but would require re-compiling postgres
FROM postgres:12-bullseye

RUN apt-get update && apt-get install -y\
    postgis\
    postgresql-12-postgis-3

