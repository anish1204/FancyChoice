const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const c = require('../controllers/admin.controller');

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/dashboard', c.dashboard);
router.get('/users', c.listUsers);
router.patch('/users/:id/role', c.setRole);

module.exports = router;
