//import express from 'express';


const express = require('express');
const path = require('path');
const multer = require('multer');
const userController = require('../controllers/userController');

const router = express.Router();
router.use(express.json());

//const router=express();


const storage=multer.diskStorage({
    destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../public/images'));
    },
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
});

const upload=multer({storage:storage});



router.post('/register',upload.single('image'),userController.userRegister);

module.exports=router;