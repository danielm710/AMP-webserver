# Install frontend
FROM node:14.7-alpine AS frontend
WORKDIR /frontend
ENV PATH /app/node_modules/.bin:$PATH
# Install node modules
COPY ./frontend/package.json /frontend/package.json
COPY ./frontend/package-lock.json /frontend/package-lock.json
# Copy necessary files
COPY ./frontend/src /frontend/src
COPY ./frontend/public /frontend/public

RUN npm install --silent
RUN npm run build

# Install backend
FROM ubuntu:18.04

RUN apt-get update

# Install curl
RUN apt-get install -y curl

# Install Node.js v12
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

# Install HMMER
RUN apt-get install -y hmmer

# Install Python 3.5.2
RUN apt-get install -y python3.5
RUN apt-get install -y python3-pip

# Install git
RUN apt-get install -y git

# Make directory to store pipeline
WORKDIR /pipeline
# clone AXIOME3 Pipeline repository
RUN git clone --single-branch --branch dev https://github.com/danielm710/AMP-Predictor-Test.git

# Make /backend working directory; backend code lives here
WORKDIR /backend

# Copy build file here
COPY --from=frontend /frontend/build /backend/build

# add `/app/node_modules/.bin` to $PATH
ENV PATH /backend/node_modules/.bin:$PATH

# Install node modules
COPY ./backend/package.json /backend/package.json
COPY ./backend/package-lock.json /backend/package-lock.json
RUN npm install --silent

COPY ./backend/custom /backend/custom
COPY ./backend/routes /backend/routes
COPY ./backend/requirements.txt /backend/requirements.txt
COPY ./backend/server.js /backend/server.js
COPY ./backend/worker.js /backend/worker.js

RUN pip3 install -r requirements.txt