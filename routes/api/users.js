const express = require('express');
const router = express.Router();
const User = require('../../models/users');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// @route POST /api/users
// @desc  Register user
// @access Public

router.post('/',

    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Email is invalid').isEmail(),
        check('password', 'Password should be at least 6 characters').isLength({min: 6})
    ],

    async (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({errors: errors.errors});

        const {name, email, password} = req.body;

        try{
            let user = await User.findOne({ email });
            if(user)
                return res.status(400).json({errors: [{'msg': 'User already exists'}]});

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                password,
                avatar
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            res.status(201).send('User registered');

        } catch(err){
            console.log(err.message);
            res.status(500).send('Server error');
        } 
});

module.exports = router;