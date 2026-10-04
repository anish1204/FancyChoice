const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/plans', require('./plan.routes'));
router.use('/subscriptions', require('./subscription.routes'));
router.use('/deliveries', require('./delivery.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/admin', require('./admin.routes'));

// Alias: README documents GET /api/subscriptions/plans -> same as GET /api/plans
router.get('/subscriptions/plans', require('../controllers/plan.controller').list);

module.exports = router;
