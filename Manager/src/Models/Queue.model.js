import mongoose from "mongoose";


const queueSchema = new mongoose.Schema({
    fileid : {
        type: String,
        required: true,
        unique: true    
    },
    ContentType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1d' // Document will be automatically removed after 1 day
    }
})

export const Queue = mongoose.model("Queue" , queueSchema)