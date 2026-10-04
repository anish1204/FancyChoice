const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const c = require('../controllers/delivery.controller');

const router = Router();
router.use(authenticate);

router.get('/today', c.today);
router.get('/history', c.history);
router.get('/my-ratings', authorize('deliveryBoy', 'admin'), c.myRatings);
router.get('/:id', c.getById);
router.get('/:id/qr-code', c.qrCode);
router.post('/:id/verify-qr', c.verifyQr);
router.post('/:id/rate', c.rate);
router.patch('/:id/status', authorize('deliveryBoy', 'admin'), c.updateStatus);
router.post('/:id/assign', authorize('admin'), c.assign);

module.exports = router;
