import { Router } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userRouter = Router();

// const userAuth = async (req, res, next) => {
//     try {
//         const token = req.headers.authorization.split(' ')[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.userId = decoded.userId;
//         next();
//     } catch (error) {
//         res.status(401).json({error: 'Unauthorized'});
//     }
// }

userRouter.post('/register', async (req, res) => {
    try {
        const {email, password, ethnicity, location, special_onahs, preferences} = req.body;

        if (!email || !password) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: 'User already exists'});
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            email,
            password: hashedPassword,
            ethnicity,
            special_onahs,
            location,
            preferences
        });

        const savedUser = await newUser.save();

        // eslint-disable-next-line no-unused-vars
        const {password: userPassword, ...userNoPassword} = savedUser.toObject();

        res.status(201).json({
            message: 'User registered successfully',
            user: userNoPassword
        });

    } catch (error){
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }

        res.status(500).json({error: 'Internal server error'});
    }
})

userRouter.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        
        if (!user) {
            return res.status(401).json({error: 'Invalid email'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({error: 'Invalid password'});
        }

        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h'}
        );

        // eslint-disable-next-line no-unused-vars
        const {password: userPassword, ...userNoPassword} = user.toObject();

        res.json({
            message: 'Login successful',
            token,
            user: userNoPassword
        });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

userRouter.get('/', async (_req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

export default userRouter;