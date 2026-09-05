# ---- Stage 1: Build ----
# Uses Node only to run the build - none of this tooling (npm, TypeScript
# compiler, Vite) is needed at runtime, which is exactly why this is a
# multi-stage build.
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build-time env var: Vite bakes VITE_* variables into the compiled JS
# at build time, not read at runtime like a backend service would. This
# means the API URL is fixed at the time this image is built - pass it
# via --build-arg when building for a specific environment.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Stage 2: Serve ----
# Tiny nginx image just to serve the static files - the final image
# doesn't contain Node, npm, or any source code, only the compiled
# HTML/CSS/JS output. This is why the image ends up small despite the
# build stage installing a full Node toolchain.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
