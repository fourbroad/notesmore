# Notesmore

1. Notesmore Installation Guide

1.1 Dependency

1) Elasticsearch 6.3
2) Nodejs 8.15
3) Redis 4.0


1.2 Frontend Installation

1) Download the notesmore source code from github:

git clone https://github.com/fourbroad/notesmore.git

2) Install the necessary node modules:

npm install

3) Start the webpack development environment:

A) Compile context, run once at the beginning, if the Context changes, you need to run again.

npm run context

B) Start the development environment.

npm start


4) Open the Chrome browser and type http://localhost:8080


1.3 Access Control Gate (ACG) Installation

1) Download the notesmore source code from github:

git clone https://github.com/fourbroad/notesmore.git

2) Install the necessary node modules:

npm install

3) Start Access Control Gate(ACG):

NODE_ENV=production HTTP_AUTH=[username]:[password] node server.js