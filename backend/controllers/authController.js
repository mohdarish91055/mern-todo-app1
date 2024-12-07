const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

//register user
exports.registerUser = async (req,res)=>{
    const {name,email,password} = req.body;
    try{
        if(!name || !email || !password){
            return res.send({
                message:'Please provide email and password'
            })
        }

        //check if user is already exist
        const exitUser = await User.findOne({email});
        if(exitUser){
            return res.send({
                message:'User already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const user = new User({
            name,
            email,
            password:hashedPassword,
        });
        await user.save();
        console.log(`@{email} registered`);
        res.status(201).send({
            success: true,
            message: 'New user registered',
        })
    }
    catch(error){
        console.log('error in registeraton',error);
        res.status(500).send({
            message:'error in registration'
        })
    }
}

//login user
exports.loginUser = async (req,res)=>{
    const {email , password} = req.body;
    try{
        // Check if email and password are provided
        if(!email || !password){
           return res.status(400).send({
                message:'Please provide email and password',
            })
        }
        
        // Find the user by email
        const user = await User.findOne({email});
        if(!user){
           return res.status(404).send({
                message: 'User not found',
            })
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).send({
                message: 'Invalid email or password',
             })
        }

        // Generate JWT token if login is successful
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        //send toke in http only cookies
        res.cookie('token',token,{
            httpOnly:true,
            secure:false,
            samSite:'none',
            maxAge: 24*60*60*1000,
        })

        console.log(`${email} login successfully`);
        
        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, name: user.name, email: user.email },
          });
    }
    catch(error){
        console.log('error in login',error);
        res.status(500).send({
            message:'error in login'
        })
    }
}

//logout user
exports.logoutUser = (req,res)=>{
    res.cookie('token','',{
        httpOnly:true,
        secure:false,
        samSite:'None',
        expires:new Date(0)+24*60*60*100,
    });

    res.status(200).json({ message: 'Logged out successfully' });
    console.log(`${req.email} logout successfully`)
}
