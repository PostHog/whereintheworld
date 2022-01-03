FROM python:3.9-alpine3.14

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /code

# Install OS dependencies needed to run whereintheworld
#
# Note: please add in this section runtime dependences only.
# If you temporary need a package to build a Python or npm
# dependency take a look at the sections below.
RUN apk --update --no-cache add \
    "geos~=3" \
    "gdal~=3" \
    "binutils" \
    "nodejs" \
    "npm" \
    && ln -s /usr/lib/libgdal.so.28 /usr/lib/libgdal.so \
    && ln -s /usr/lib/libgeos_c.so.1 /usr/lib/libgeos_c.so \
    && npm install -g yarn@1

# Compile and install Python dependencies.
#
# Notes:
#
# - we explicitly COPY the files so that we don't need to rebuild
#   the container every time a dependency changes
#
# - we need few additional OS packages for this. Let's install
#   and then uninstall them when the compilation is completed.
COPY requirements.txt ./
RUN apk --update --no-cache --virtual .build-deps add \
    "git~=2" \
    "postgresql-dev~=13" \
    "g++~=10.3" \
    "gcc~=10.3" \
    "libffi-dev~=3.3" \
    && \
    pip install -r requirements.txt --compile --no-cache-dir \
    && \
    apk del .build-deps

# Compile and install Yarn dependencies.
#
# Notes:
#
# - we explicitly COPY the files so that we don't need to rebuild
#   the container every time a dependency changes
#
# - we need few additional OS packages for this. Let's install
#   and then uninstall them when the compilation is completed.
COPY package.json yarn.lock ./
RUN yarn config set network-timeout 300000 && \
    yarn install --frozen-lockfile && \
    yarn cache clean

# Copy everything else
COPY . .

# Build the frontend
#
# Note: we run the build as a separate actions to increase
# the cache hit ratio of the layers above.
RUN yarn build && \
    yarn cache clean && \
    rm -rf ./node_modules

# Generate Django's static files
RUN SECRET_KEY='unsafe secret key for collectstatic only' python manage.py collectstatic --noinput

# Add a dedicated 'whereintheworld' user and group, move files into its home dir and set the
# proper file permissions. This alleviates compliance issue for not running a
# container as 'root'
RUN addgroup -S whereintheworld && \
    adduser -S whereintheworld -G whereintheworld && \
    mv /code /home/whereintheworld && \
    chown -R whereintheworld:1000 /home/whereintheworld/code
WORKDIR /home/whereintheworld/code
USER whereintheworld

# Expose container port and run entry point script
EXPOSE 8000
CMD ["./bin/docker"]
