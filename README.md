interprete
==========

Test Node.js app with video chat.

Installation
===========

Clone the repo and run: 
```
npm install
```

Running
===========

Make sure you have `nodemon` installed like so:

```
npm install -g nodemon
```

You can run it locally and it'll listen to file changes, but it will connect to your local MongoDB like this:
```
nodemon ./bin/www
```

Or you can run it with the production database like this:
```
foreman start
```
