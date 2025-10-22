import express  from 'express';
import { upload } from '../Controllers/upload.Controller.js';

// initialize router
const router = express.Router();


router.post('/uplaod-video' , upload)



export default router;