FROM ubuntu:18.04

RUN apt-get update

# Install curl
RUN apt-get install -y curl

# Install Node.js v12
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
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
RUN git clone https://github.com/danielm710/AMP-Predictor-Test.git

# Make /backend working directory; backend code lives here
WORKDIR /backend

# add `/app/node_modules/.bin` to $PATH
ENV PATH /backend/node_modules/.bin:$PATH

# Install node modules
COPY package.json /backend/package.json
COPY package-lock.json /backend/package-lock.json
COPY requirements.txt /backend/requirements.txt
RUN npm install --silent

RUN pip3 install -r requirements.txt