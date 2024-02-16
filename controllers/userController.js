const model = require('../models/userModel');
const bcrypt = require('bcrypt');

const userRegister = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;

        // const isExists = await model.findOne({ email });

        // if (isExists) {
        //     return res.status(400).json({
        //         success: false,
        //         msg: "Email Already Exists!"
        //     });
        // }

        

        const hashPassword = await bcrypt.hash(password, 10);
        //const image = req.files.image ? 'images/' + req.files.image.filename : '';
        const image = req.file ? 'images/' + req.file.filename : ''

        const baseUrl = 'http://localhost:3000'; // Replace this with your base URL
        const imagePath = 'images/' + req.file.filename; // Assuming you've saved the image in the 'images/' folder
        
        const imageUrl = baseUrl + '/' + imagePath; // Construct the complete image URL
        
        console.log('Image URL:', imageUrl);


        console.log("dsfhskjd"+req.file );
        const user = new model({
            name,
            email,
            mobile,
            password: hashPassword,
            image: image
        });

        const userData = await user.save();

        return res.status(200).json({
            success: true,
            msg: "Register Successfully",
            user: userData
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

module.exports = {
    userRegister: userRegister
};
