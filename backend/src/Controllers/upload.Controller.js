import {redisConnection} from '../Configs/RedisConnection.js';
import { Queue } from 'bullmq';


const upload = async (req, res) => {
    try {
        const videoId = req.body.videoid;
        const rawVidoeUrl = `https://temp.cloudcoderhub.in/${videoId}.mp4`;

        console.log('Received video upload request for videoId:', rawVidoeUrl);



        const videoProcessingQueue = new Queue('vaanitube-vidoe-processing-start-queue', { redisConnection });
        await videoProcessingQueue.add('start-video-processing', { videoUrl: rawVidoeUrl, videoId });


        return res.status(200).json({ message: 'Upload successful, video processing started' });
    } catch (err) {
        return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
}



export { upload }