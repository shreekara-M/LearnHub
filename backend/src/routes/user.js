const express = require('express');

const { verifyToken } = require('@middleware/authMiddleware');
const userController = require('@controllers/userController');

const router = express.Router();

router.use(verifyToken);
router.get('/dashboard', userController.dashboard);

module.exports = router;