const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/user.controller');

const router = Router();
router.use(authenticate);

router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.post('/address', c.addAddress);
router.put('/address/:addressId', c.updateAddress);
router.delete('/address/:addressId', c.deleteAddress);
router.delete('/account', c.deleteAccount);

module.exports = router;
