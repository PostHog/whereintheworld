# #whereintheworld

## Development server

The code for the server is located in the [`backend`](./backend) directory.

Install dependencies

```
brew install gdal
pip install -r requirements-test.txt
pip install -r requirements.txt
```

Migrate the database and start the server

```
python manage.py migrate
python manage.py cities --import=all
python manage.py runserver
```

The server is now running at [`http://localhost:3001/`](http://localhost:3001/).

### 3. Start the app (frontend)

The code for the Next.js app is located in the [`frontend`](./frontend) directory. Once you launched the server, you can start it as follows:

```
cd ../frontend
yarn install
yarn start
```

The app is now running, navigate to [`http://localhost:3000/`](http://localhost:3000/) in your browser to explore its UI.
