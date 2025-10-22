FROM ubuntu:focal

RUN /usr/bin/apt-get update && \
    /usr/bin/apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    /usr/bin/apt-get update && \
    /usr/bin/apt-get upgrade -y && \
    /usr/bin/apt-get install -y nodejs ffmpeg

WORKDIR /home/app


COPY 'package.json' .
COPY 'package-lock.json' .

RUN npm install

COPY 'hls_output' .
COPY 'uploads' .
COPY 'index.js' .
COPY 'resizedthumbnail' .
COPY 'thumbnailOUtput' .

CMD ["node", "index.js"]