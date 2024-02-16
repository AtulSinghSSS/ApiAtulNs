const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const app = express();
const port = process.env.SERVER_PORT || 3000;

app.use(express.json());
app.use('/api', userRoute);

mongoose.connect('mongodb://127.0.0.1:27017/restful-auth-api')
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });
