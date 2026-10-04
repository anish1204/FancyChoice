const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const c = require('../controllers/payment.controller');

const router = Router();
router.use(authenticate);

router.post('/intent', c.createIntent);
router.post('/:id/confirm', c.confirm);
router.get('/my', c.myPayments);
router.post('/:id/refund', authorize('admin'), c.refund);

module.exports = router;
