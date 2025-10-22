import { configDotenv } from "dotenv";
import fs from 'fs'
import path from "path";
import { Worker, Job } from "bullmq";
import axios from "axios";
import sharp from "sharp";


configDotenv()



// important folder
const downloadfolder = 'download'
const uploadfolder = 'output'



// generate a unique filename
const uniquefilename = Math.random().toString(36).substring(2, 14)
let inputfile;

const thumbnailSizes = [
  { name: "480p", width: 480, height: 270 },
  { name: "720p", width: 720, height: 405 },
  { name: "1080p", width: 1280, height: 720 },
];


const DownloadThumbnail = async (thumbnailUrl , extension) => {
    try {
        inputfile = `${downloadfolder}/${uniquefilename}.${extension}/`
        const res = await axios.get(thumbnailUrl, { responseType: "stream" });
        const writefile = fs.createWriteStream(inputfile);
        res.data.pipe(writefile);

        await new Promise( (resolve , reject) => {
            writefile.on('finish' , resolve);
            writefile.on('error' , reject)
        })

        console.log('vidoe download Successfull')
    } catch (error) {
        return error
    }
}





 



