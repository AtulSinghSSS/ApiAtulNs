const userModel = require('../models/userModel');
const blackListModel = require('../models/blackListModel');
const mailOtpModel = require('../models/mailOtpModel');
const cafeDashBoardModel = require('../models/cafeDashBoardModel');
const bcrypt = require('bcrypt');
const mailer = require('../helpers/mailer');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');



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

        const isExists = await userModel.findOne({ email });

        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: "Email Already Exists!"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const image = req.file ? 'images/' + req.file.filename : ''

        // const baseUrl = 'http://localhost:3000'; // Replace this with your base URL
        // const imagePath = 'images/' + req.file.filename; // Assuming you've saved the image in the 'images/' folder

        // const imageUrl = baseUrl + '/' + imagePath; // Construct the complete image URL
        const user = new userModel({
            name,
            email,
            mobile,
            password: hashPassword,
            image: image
        });

        const userData = await user.save();
        const link = 'http://localhost:3000/mail-verification?id=' + userData._id;
        const msg = `<p>Hi, ${name}, please <a href="${link}">verify</a> your email</p>`;

        mailer.sendMail(email, 'mail Verification', msg);

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

const mailVerification = async (req, res) => {
    try {
        if (req.query.id == undefined) {
            return res.render('404')
        }
        const userData = await userModel.findOne({ _id: req.query.id });
        if (userData) {
            console.log("1s" + userData.is_verified)
            if (userData.is_verified == 1) {
                return res.render('mail-verification', { message: 'Your mail already verified!' })
            }
            await userModel.findByIdAndUpdate({ _id: req.query.id },
                {
                    $set: { is_verified: 1 }
                });
            return res.render('mail-verification', { message: 'mail has been verified successfully!' });
        } else {
            res.render('mail-verification', { message: 'User Not Found' })
        }

    } catch (error) {
        console.log(error.message);
        return res.render('404');
    }
};

const genrateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
    return token;
};

const genrateRefreshToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "4h" });
    return token;
};
const userLogin = async (req, res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors",
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        const userData = await userModel.findOne({ email });
        if (!userData) {
            return res.status(401).json({
                success: false,
                msg: 'Email and password is Incorrect'
            });

        }
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                msg: 'Email and password is Incorrect'
            });

        }

        if (userData.is_verified == 0) {
            return res.status(401).json({
                success: false,
                msg: 'Plese Verify your Accont!'
            });

        }

        const accessToken = await genrateAccessToken({ user: userData });
        const refreshToken = await genrateRefreshToken({ user: userData });

    
    

        return res.status(200).json({
            success: true,
            msg: 'Login Successfully!',
            data: {
                   userData,
                   accessToken: accessToken, 
                   refreshToken: refreshToken,
                   tokenType: 'Bearer'
                }


        });

        // console.log("adjshdfjh"+userData);

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

};

const userProfile = async (req, res) => {
    try {

        const crypto = require('crypto');
        const encryptionKey = 'your-encryption-key-here-atulsingh';
        const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
        const encription = req.headers.encription;
        const userData = req.user.user;
        const userDataString = JSON.stringify(userData);

        if (encription == 1) {
            return res.status(200).json({
                success: true,
                msg: 'User Profile Data!',
                data: userData
            });
        }

        let encryptedUserData = cipher.update(userDataString, 'utf8', 'hex');
        encryptedUserData += cipher.final('hex');
        // Send the encrypted user data in the response
        if (encription == 0) {
            return res.status(200).json({
                success: true,
                msg: 'Encrypted User Profile Data!',
                data: encryptedUserData
            });
        }

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

}

const refreshToken = async (req, res) => {
    try {

        const userId = req.user.user._id;
        const userData = await userModel.findOne({ _id: userId });

        const accessToken = await genrateAccessToken({ user: userData });
        const refreshToken = await genrateRefreshToken({ user: userData });



        return res.status(200).json({
            success: true,
            msg: 'Token Refreshed!',
            accessToken: accessToken,
            refreshToken: refreshToken
        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

}

const logOut = async (req, res) => {
    try {


        const token = req.body.token || req.query.token || req.headers["authorization"];
        const bearer = token.split(' ');
        const bearerToken = bearer[1];


        const newBlackList = new blackListModel({
            token: bearerToken
        });
        await newBlackList.save();

        res.setHeader('Clear-Site-Data', '"cookies","storage"');

        return res.status(200).json({
            success: true,
            msg: 'You are logged out!',

        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

}

const genrateRandom4Digit = async () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const sendEmailOtp = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const userData = await userModel.findOne({ email });

        console.log(userData)


        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email doesn't exists!",
            });
        }

        if (userData.is_verified == 1) {
            return res.status(401).json({
                success: false,
                msg: userData.email + 'mail is already verified!'
            });

        }
        const g_otp = await genrateRandom4Digit();

        console.log("atulsingh   " + userData._id)
        const enter_otp = new mailOtpModel({
            user_id: userData._id,
            otp: g_otp
        })

        await enter_otp.save();

        const msg = '<p>Hi <b>' + userData.name + '</b>,<h4> ' + g_otp + '</h4></p>';
        mailer.sendMail(userData.email, 'mailOtp Verification', msg);

        return res.status(200).json({
            success: false,
            msg: 'Opt has been sent to your mail, please check!',
        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

}

const dashBoard = async (req, res) => {
    try {
      
        const { banner, category, recommend } = req.body;

        // Check if the document already exists
        const existingData = await cafeDashBoardModel.findOne({ /* your query criteria */ });
        
        if (existingData) {
          // Document exists, update it
          existingData.banner = banner;
          existingData.category = category;
          existingData.recommend = recommend;
          
          const updatedData = await existingData.save();
          
          return res.status(200).json({
            success: true,
            msg: "Data updated successfully",
            data: updatedData
          });
        } else {
          // Document doesn't exist, insert it
          const newData = new cafeDashBoardModel({ banner, category, recommend });
          
          const userData = await newData.save();
          
          return res.status(200).json({
            success: true,
            msg: "Data inserted successfully",
            data: userData
          });
        }
        

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

}

const getDashBoard = async (req, res) => {
    try {
        const { banner, category, recommend } = await cafeDashBoardModel.findOne();
        const allBannerItems = banner.map(item => ({ price: item.price, itemName: item.itemName,image:item.image })).flat();
        const allCategoryItems = category.map(item => ({ price: item.price, itemName: item.itemName,image:item.image })).flat();
        const allRecommendItems = recommend.map(item => ({ price: item.price, itemName: item.itemName,image:item.image })).flat();

        return res.status(200).json({
            success: true,
            msg: "Data fetch Successfully",
            data: [{
                banner: allBannerItems,
                category: allCategoryItems,
                recommend: allRecommendItems
            }]

        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

}

const paymentGetWay = async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.KEYId,
            key_secret: process.env.KEYSECRET
        });

        const order = await razorpay.orders.create({
            amount: 1 * 100, // Razorpay expects amount in paise
            currency: 'USD',
            payment_capture: 1 // Auto capture payments

        });

        return res.status(200).json({
            success: true,
            msg: error.message,
            orderid: { order }
        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });

    }

    
}

module.exports = {
    userRegister: userRegister,
    mailVerification: mailVerification,
    userLogin: userLogin,
    userProfile: userProfile,
    refreshToken: refreshToken,
    logOut: logOut,
    sendEmailOtp: sendEmailOtp,
    dashBoard: dashBoard,
    getDashBoard: getDashBoard,
    paymentGetWay: paymentGetWay,
};
