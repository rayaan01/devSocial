const express = require('express');
const router = express.Router();

// @route GET /api/profile
// @access Public

router.get('/', (req, res) => {
    res.send('Profile accessed');
});

module.exports = router;