const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/auth.controller');

const router = Router();

router.post(
  '/send-otp',
  [body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone required')],
  validate,
  c.sendOtp
);

router.post(
  '/verify-otp',
  [
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid phone required'),
    body('otp').isLength({ min: 4, max: 8 }).withMessage('OTP required'),
  ],
  validate,
  c.verifyOtp
);

router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name required'),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid phone required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  validate,
  c.signup
);

router.post(
  '/login',
  [body('identifier').notEmpty().withMessage('Phone or email required'), body('password').notEmpty().withMessage('Password required')],
  validate,
  c.login
);

router.post('/logout', c.logout);
router.get('/me', authenticate, c.me);

module.exports = router;
