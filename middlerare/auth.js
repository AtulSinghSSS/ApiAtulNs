const jwt=require("jsonwebtoken");
const blackListModel=require("../models/blackListModel");

const config=process.env;

const verifyToken=async(req,res,next)=>{
    const token =req.body.token || req.query.token ||req.headers["authorization"];
    if(!token){
        return res.status(401).json({
            success:false,
            msg:'A token is required for authentication'
        });
    }

    try {
        const bearer=token.split(' ');
        const bearerToken=bearer[1];

        const balckListToken=await blackListModel.findOne({token:bearerToken})

        if (balckListToken) {
            return res.status(401).json({
                success:false,
                msg:'This session has expired ,please try again!'
            });
        }

        const decodedData=jwt.verify(bearerToken,config.ACCESS_TOKEN_SECRET);
        req.user=decodedData;
        
    } catch (error) {
        return res.status(401).json({
            success:false,
            msg:'Invalid token'
        });
    }
    return next();
};

module.exports=verifyToken