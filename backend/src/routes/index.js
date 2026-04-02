const express = require('express');

const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const publicCourseRoutes = require('./public');
const protectedCourseRoutes = require('./protected');
const paymentRoutes = require('./payment');
const streamRoutes = require('./stream');
const userRoutes = require('./user');

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is operational'
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/courses', publicCourseRoutes);
router.use('/courses', protectedCourseRoutes);
router.use('/payments', paymentRoutes);
router.use('/lessons', streamRoutes);
router.use('/user', userRoutes);

module.exports = router;