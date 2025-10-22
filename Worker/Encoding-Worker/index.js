import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { spawn } from 'child_process';
import { configDotenv } from 'dotenv';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { getVideoDurationInSeconds } from 'get-video-duration'
import sharp from 'sharp';




configDotenv();



// redis connection
const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
  //password: process.env.REDIS_PASSWORD
});



const s3client = (endpoint, accessId, accessKey) => {
  return new S3Client({
    endpoint: endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: accessId,
      secretAccessKey: accessKey
    },
    forcePathStyle: true
  });
};



// Paths and filenames
const ffmpegPath = '/usr/bin/ffmpeg';
const outputDir = 'hls_output';
const thumbnailoutputDir = 'thumbnailOutput';
const uploadsDir = 'uploads';
const ffprobePath = "/usr/bin/ffprobe";
const resizedThumbnailPath = 'resizedthumbnail'



const resolutions = [
  { name: "144p", height: 144, videoBitrate: "150k", audioBitrate: "64k" },
  { name: "240p", height: 240, videoBitrate: "300k", audioBitrate: "64k" },
  { name: "360p", height: 360, videoBitrate: "800k", audioBitrate: "96k" },
  { name: "480p", height: 480, videoBitrate: "1200k", audioBitrate: "128k" },
  { name: "720p", height: 720, videoBitrate: "2500k", audioBitrate: "128k" },
  { name: "1080p", height: 1080, videoBitrate: "5000k", audioBitrate: "192k" }
];


const thumbnailSizes = [
  { name: "480p", width: 480, height: 270 },
  { name: "720p", width: 720, height: 405 },
  { name: "1080p", width: 1280, height: 720 },
];


// Generate a unique filename
const filename = Math.random().toString(36).substring(2, 15);
let inputFile = `${uploadsDir}/${filename}`;



if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(thumbnailoutputDir)) fs.mkdirSync(thumbnailoutputDir, { recursive: true });
if (!fs.existsSync(resizedThumbnailPath)) fs.mkdirSync(resizedThumbnailPath, { recursive: true });


// Download video
const downloadVideo = async (vidoeUrl) => {
  try {
    const response = await axios.get(
      `${vidoeUrl}`,
      { responseType: 'stream' }
    );

    const extension = path.extname(new URL(vidoeUrl).pathname).toLowerCase();
    inputFile = `${uploadsDir}/${filename}${extension}`;
    const writer = fs.createWriteStream(inputFile);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(' Video downloaded successfully');
  } catch (err) {
    console.error(' Error downloading video:', err.message);
    process.exit(0);
  }
};


const makethumbnail = async (inputFile) => {

  try {
    const duration = await getVideoDurationInSeconds(inputFile);
    const randomSecond = Math.floor(Math.random() * duration);


    const timeStamp = new Date(randomSecond * 1000).toISOString().substring(11, 19);
    const thumbnailPath = path.join(thumbnailoutputDir , `${filename}.jpg`)

    const args = [
      "-ss", timeStamp,
      "-i", inputFile,
      "-vframes", "1",
      "-q:v", "2",
      thumbnailPath,
    ];
    const ffmpeg = spawn(ffmpegPath, args);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(` Thumbnail generated at ${timeStamp}`);
      } else {
        console.error(` FFmpeg exited with code ${code}`);
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      console.error(`FFmpeg error: ${data}`);
    });
  } catch (error) {
    return error;
  }
}



const resizeThumbnailAndUpload = async (videoId, endpoint, accessId, accessKey) => {
  for (const s of thumbnailSizes) {
    await sharp(thumbnailoutputDir)
      .resize(s.width, s.height, { fit: "cover" })
      .jpeg({ quality: 98 })
      .toFile(resizedThumbnailPath);

    const stream = fs.createReadStream(resizedThumbnailPath);

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${videoId}/thumbnails/${s.name}.jpg`,
      Body: stream,
      ContentType: "image/jpeg",
    });

    const client = s3client(endpoint, accessId, accessKey)
    try {
      await client.send(command);
      console.log(` Uploaded ${s.name} thumbnail`);
    } catch (err) {
      console.error(` Failed ${s.name}:`, err.message);
    }
  }
};



async function getVideoHeight(inputFile) {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=height",
      "-of", "csv=p=0",
      inputFile
    ];
    const ffprobe = spawn(ffprobePath, args);
    let output = "";

    ffprobe.stdout.on("data", (data) => (output += data.toString()));
    ffprobe.on("close", (code) => {
      if (code === 0) resolve(parseInt(output.trim(), 10));
      else reject(new Error("Failed to get video height"));
    });
  });
}

// Convert to HLS
export const convertToHLS = async (inputFile, outputDir) => {
  const videoHeight = await getVideoHeight(inputFile);
  console.log(`🎥 Input resolution: ${videoHeight}p`);


  const selectedResolutions = resolutions.filter(r => r.height <= videoHeight);


  fs.mkdirSync(outputDir, { recursive: true });

  const masterPlaylistPath = path.join(outputDir, "master.m3u8");
  let masterPlaylist = "#EXTM3U\n";

  for (const r of selectedResolutions) {
    const variantDir = path.join(outputDir, r.name);
    fs.mkdirSync(variantDir, { recursive: true });

    const playlistPath = path.join(variantDir, "playlist.m3u8");
    const segmentPattern = path.join(variantDir, "segment%03d.ts");

    const args = [
      "-i", inputFile,
      "-vf", `scale=-2:${r.height}`,
      "-c:v", "libx264",
      "-b:v", r.videoBitrate,
      "-c:a", "aac",
      "-b:a", r.audioBitrate,
      "-hls_time", "2",
      "-hls_playlist_type", "vod",
      "-hls_segment_filename", segmentPattern,
      "-start_number", "0",
      playlistPath
    ];

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath, args);
      ffmpeg.stderr.on("data", (data) => console.log(`[${r.name}]`, data.toString()));
      ffmpeg.on("close", (code) => {
        if (code === 0) {
          console.log(` ${r.name} conversion complete`);
          resolve();
        } else reject(new Error(`FFmpeg failed for ${r.name}`));
      });
    });


    masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.videoBitrate) * 8},RESOLUTION=1920x${r.height}\n`;
    masterPlaylist += `${r.name}/playlist.m3u8\n`;
  }

  fs.writeFileSync(masterPlaylistPath, masterPlaylist);
  console.log(" Master playlist generated at:", masterPlaylistPath);
};



// Upload HLS files
const uploadFiles = async (videoid, endpoint, accessId, accessKey) => {
  const client = s3client(endpoint, accessId, accessKey)
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    const filePath = path.join(outputDir, file);

    if (fs.lstatSync(path.join(outputDir, file)).isDirectory()) {
      const dirFiles = fs.readdirSync(path.join(outputDir, file));
      for (const dirFile of dirFiles) {
        const dividerfilePath = path.join(filePath, dirFile,);
        const fileStream = fs.createReadStream(dividerfilePath);

        const filename = path.parse(dirFile).name;
        const fileExtension = path.parse(dirFile).ext.substring(1);
        const contentType = fileExtension === 'ts' ? 'video/MP2T' : 'application/x-mpegURL';

        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: `${videoid}/video/${path.parse(file).name}/${filename}.${fileExtension}`,
          Body: fileStream,
          ContentType: contentType,
        });


        try {
          await client.send(command);
          console.log(` Uploaded ${dirFile} to R2`);
        } catch (err) {
          console.error(` Failed to upload ${dirFile}:`, err.message);
        }
      }
    }
    else {
      const fileStream = fs.createReadStream(filePath);

      const filename = path.parse(file).name;
      const fileExtension = path.parse(file).ext.substring(1);
      const contentType = fileExtension === 'ts' ? 'video/MP2T' : 'application/x-mpegURL';

      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `${videoid}/video/${filename}.${fileExtension}`,
        Body: fileStream,
        ContentType: contentType,
      });



      try {
        await client.send(command);
        console.log(`Uploaded ${file} to R2`);
      } catch (err) {
        console.error(` Failed to upload ${file}:`, err.message);
      }
    }
  }
};


const worker = new Worker("vaanitube-vidoe-processing-start-queue", async (job) => {
  const { videoUrl } = job.data;
  await downloadVideo(videoUrl);
  await makethumbnail(inputFile)
  await convertToHLS(inputFile, outputDir);

  if (job.data.storagetype === 'r2') {
    await resizeThumbnailAndUpload(job.data.videoId, process.env.R2_ENDPOINT, process.env.R2_ACCESSID, process.env.R2_ACCESSKEY)
    await uploadFiles(job.data.videoId, process.env.R2_ENDPOINT, process.env.R2_ACCESSID, process.env.R2_ACCESSKEY);
  }

  if (job.data.storagetype === 'minio') {
    await resizeThumbnailAndUpload(job.data.videoId, process.env.MINIO_ENDPOINT, process.env.MINIO_ACCESSID, process.env.MINIO_ACCESSKEY)
    await uploadFiles(job.data.videoId, process.env.MINIO_ENDPOINT, process.env.MINIO_ACCESSID, process.env.MINIO_ACCESSKEY);
  }
  console.log(' Job done!');
}, { connection });


worker.on('completed', async (job) => {
  const videoProcessingCompletedQueue = new Queue('vaanitube-video-processing-completed-queue', { connection });
  const deleteUploadedVideoQueue = new Queue('vaanitube-delete-uploaded-video-queue', { connection });

  await deleteUploadedVideoQueue.add('delete-uploaded-video', { videoId: job.data.videoId });
  await videoProcessingCompletedQueue.add('video-processed', { message: 'Video processing completed successfully.', videoId: job.data.videoId });
  process.exit(0);
});