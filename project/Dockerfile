FROM node:20.11.1 as build

WORKDIR /src

RUN apt-get update && apt-get upgrade -y

COPY . .

RUN yarn set version 4.1.0

RUN yarn install

CMD ["/bin/bash"]