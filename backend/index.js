import app from "./server.js";



// import Routes Path
import userRoutes from './src/Routes/user.Route.js';













// Routes
app.use('/api/user', userRoutes);









app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


