const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
router.use(express.json());
const userController = require('../controllers/userController');
const {registerValidator} = require('../helpers/validation');


const storage=multer.diskStorage({
    destination:function(req,file,cb){

        if (file.mimetype ==='image/jpeg' || file.mimetype ==='image/png') {
            cb(null,path.join(__dirname,'../public/images'));
        }


    cb(null,path.join(__dirname,'../public/images'));
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
});


const fileFilter=(req,file,cb)=>{
    if (file.mimetype ==='image/jpeg' || file.mimetype ==='image/png') {
        cb(null,true);
    }else{
        cb(null,false);
    }

}

const upload=multer({
    storage:storage,
    fileFilter:fileFilter
});

router.post('/register',upload.single('image'),registerValidator,userController.userRegister);

module.exports=router;