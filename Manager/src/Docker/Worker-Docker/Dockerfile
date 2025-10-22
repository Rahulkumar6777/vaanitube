FROM ubuntu:focal

RUN /usr/bin/apt-get update && \
    /usr/bin/apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    /usr/bin/apt-get update && \
    /usr/bin/apt-get upgrade -y && \
    /usr/bin/apt-get install -y nodejs ffmpeg

WORKDIR /home/app

ENV  S3_ENDPOINT="https://b4d1e23b8235c913c5682865bd7b8d4e.r2.cloudflarestorage.com" 
ENV  S3_ACCESS_KEY_ID="45690e063caae0044aa434bedc74ab55"
ENV  S3_SECRET_ACCESS_KEY="6e51ebb1ac18da8dcee9218094cf2a46b602ffde8eedba119efbdfc33d152d90"
ENV  S3_BUCKET="devload"

COPY 'package.json' .
COPY 'package-lock.json' .

RUN npm install

COPY 'hls_output' .
COPY 'uploads' .
COPY 'index.js' .

CMD ["node", "index.js"]