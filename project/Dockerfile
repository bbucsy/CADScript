FROM node:20.11.1 as deps
WORKDIR /src
RUN apt-get update && apt-get upgrade -y
COPY . .
RUN yarn set version 4.1.0 && yarn install
CMD ["/bin/bash"]

FROM deps as build
# Build Language 
RUN yarn workspace cad-script langium:generate && yarn workspace cad-script build:lib
# Build CLI
RUN yarn workspace cli build
# Build web
RUN yarn workspace web-frontend build
CMD ["/bin/bash"]


FROM nginx:alpine as web
WORKDIR /usr/local/bin
COPY --from=build /src/packages/web-frontend/dist /usr/share/nginx/html
COPY --from=build /src/packages/web-frontend/nginx.template /etc/nginx/conf.d/default.conf

EXPOSE 80
