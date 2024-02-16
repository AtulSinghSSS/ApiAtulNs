const model = require('../models/userModel');
const bcrypt = require('bcrypt');

const mailer = require('../helpers/mailer');

const { validationResult } = require('express-validator')

const userRegister = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors",
                errors: errors.array()
            });
        }
        const { name, email, mobile, password } = req.body;

        //  const isExists = await model.findOne({ email });

        //  if (isExists) {
        //     return res.status(400).json({
        //          success: false,
        //          msg: "Email Already Exists!"
        //      });
        //  }

        const hashPassword = await bcrypt.hash(password, 10);
        const image = req.file ? 'images/' + req.file.filename : ''

        // const baseUrl = 'http://localhost:3000'; // Replace this with your base URL
        // const imagePath = 'images/' + req.file.filename; // Assuming you've saved the image in the 'images/' folder

        // const imageUrl = baseUrl + '/' + imagePath; // Construct the complete image URL
        const user = new model({
            name,
            email,
            mobile,
            password: hashPassword,
            image: image
        });

        const userData = await user.save();
        const link = 'http://localhost:3000/mail-verification?id=' + userData._id;
        const msg = `<p>Hi, ${name}, please <a href="${link}">verify</a> your email</p>`;

        //mailer.sendMail(email, 'mail Verification', msg);

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
