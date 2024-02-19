const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const app = express();
const port = process.env.SERVER_PORT || 3000;


app.use(express.json());

app.set('view engine','ejs');
app.set('views','./views');

app.use('/api', userRoute);

app.use('/', authRoute);

mongoose.connect('mongodb+srv://atulsingh28071999:Atul221@cluster2.xelkrjz.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });


