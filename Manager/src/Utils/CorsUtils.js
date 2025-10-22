const corsLocally = {
    origin: 'http://localhost:3000',
    methods: ['POST' , 'PUT' , 'GET' , "DELETE" , "OPTIONS"],
    credentials: true,
}

const corsProduction = {
    origin: 'http://localhost:3000',
    methods: ['POST' , 'PUT' , 'GET' , "DELETE" , "OPTIONS"],
    credentials: true,
}



const corsOptions = process.env.NODE_ENV === 'production' ? corsProduction : corsLocally;

export { corsOptions }