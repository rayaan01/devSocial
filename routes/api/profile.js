const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/profile');
const User = require('../../models/users');
const { check, validationResult } = require('express-validator');

// @route GET /api/profile/me
// @desc Get current user's profile
// @access Private

router.get('/me', auth, async (req, res) => {
    
    try{
        const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'avatar']);

        if(!profile)
           return res.status(401).json({ msg: 'There is no profile for the user'});

    }
    catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});

// @route GET /api/profile
// @desc Create/Update a user's profile
// @access Private

router.post('/', 
    [auth, 
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills are required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            res.status(400).json({ errors: errors.array()});

        const { 
            status, 
            skills,
            company,
            website,
            location,
            bio,
            githubusername,
            youtube,
            twitter,
            facebook,
            linkedin,
            instagram
        } = req.body;

        const profile = {};
        profile.status = status;
        profile.user = req.user.id;
        profile.skills = skills.split(',').map(skill => skill.trim());

        if(company) profile.company = company;
        if(website) profile.website = website;
        if(location) profile.location = location;
        if(bio) profile.bio = bio;
        if(githubusername) profile.githubusername = githubusername;

        profile.social = {};

        if(youtube) profile.social.youtube = youtube;
        if(twitter) profile.social.twitter = twitter;
        if(facebook) profile.social.facebook = facebook;
        if(linkedin) profile.social.linkedin = linkedin;
        if(instagram) profile.social.instagram = instagram;

        try{
            let profileField = await Profile.findOne({user: req.user.id});
            if(profileField){
                profileField = await Profile.findOneAndUpdate(
                        { user: req.user.id }, 
                        { $set: profile },
                        { new: true }
                    );
                return res.json(profileField);
            }
            
            profileField = new Profile(profile);
            await profileField.save();
            return res.json(profileField);
        }
        catch(err){
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    } 
);

// @route GET /api/profile
// @desc Get all profiles
// @access Public

router.get('/', async (req, res) => {
    try {
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;