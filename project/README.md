# Usage with docker

## Web editor

The web editor can be run with docker. To build the image run

```bash
docker image build -t cadcloud --target=web .
```

and to run the app on localhost on port 80

```bash
docker run --rm -p 80:80 cadcloud
```

## CLI and VSCode packages

Docker builds for these are coming

# Development

// TODO
