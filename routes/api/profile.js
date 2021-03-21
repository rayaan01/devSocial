const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const Post = require("../../models/posts");
const User = require("../../models/users");
const { check, validationResult } = require("express-validator");
const axios = require("axios");

// @route GET /api/profile/me
// @desc Get current user's profile
// @access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(401).json({ msg: "There is no profile for the user" });

    return res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/profile
// @desc Create/Update a user's profile
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).json({ errors: errors.array() });

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
      instagram,
    } = req.body;

    const profile = {};
    profile.status = status;
    profile.user = req.user.id;
    profile.skills = Array.isArray(skills)
      ? skills
      : skills.split(",").map((skill) => skill.trim());
    if (company) profile.company = company;
    if (website) profile.website = website;
    if (location) profile.location = location;
    if (bio) profile.bio = bio;
    if (githubusername) profile.githubusername = githubusername;

    profile.social = {};

    if (youtube) profile.social.youtube = youtube;
    if (twitter) profile.social.twitter = twitter;
    if (facebook) profile.social.facebook = facebook;
    if (linkedin) profile.social.linkedin = linkedin;
    if (instagram) profile.social.instagram = instagram;

    try {
      let profileField = await Profile.findOne({ user: req.user.id });
      if (profileField) {
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
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route GET /api/profile
// @desc Get all profiles
// @access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route DELETE /api/profile
// @desc Delete a profile
// @access PROTECTED

router.delete("/", auth, async (req, res) => {
  try {
    await Post.deleteMany({ user: req.user.id }); // Remove All User posts
    await Profile.findOneAndRemove({ user: req.user.id }); // Remove Profile
    await User.findByIdAndDelete(req.user.id); // Remove Account
    res.json({ msg: "Deleted User" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Could not delete user");
  }
});

// @route POST /api/profile/experience
// @desc update user experience
// @access PROTECTED

router.post(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const exp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(exp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route DELETE /api/profile/experience/:exp_id
// @desc Delete user experience
// @access PROTECTED

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const index = profile.experience
      .map((exp) => exp.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(index, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/profile/experience
// @desc Get all user experiences
// @access PROTECTED

router.get("/experience", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile.experience);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route POST /api/profile/education
// @desc Create user education
// @access PROTECTED

router.post(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const edu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(edu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route DELETE /api/profile/education/:edu_id
// @desc Delete user education
// @access PROTECTED

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const index = profile.education
      .map((edu) => edu.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(index, 1);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/profile/education
// @desc Get all user education
// @access PROTECTED

router.get("/education", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile.education);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

// @route GET /api/profile/github/:username
// @desc Get user github repos
// @access Public

router.get("/github/:username", async (req, res) => {
  const url = `https://api.github.com/users/${req.params.username}/repos?per_page=3`;
  try {
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Could not find user");
  }
});

module.exports = router;
