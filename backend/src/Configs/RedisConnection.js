const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    //password: process.env.REDIS_PASSWORD || '',   
}

export {redisConnection};