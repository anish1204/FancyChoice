const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const c = require('../controllers/plan.controller');

const router = Router();

router.get('/', c.list);
router.get('/:id', c.get);

// Admin only
router.post('/', authenticate, authorize('admin'), c.create);
router.put('/:id', authenticate, authorize('admin'), c.update);
router.delete('/:id', authenticate, authorize('admin'), c.remove);

module.exports = router;
