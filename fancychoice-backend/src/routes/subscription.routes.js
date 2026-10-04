const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const c = require('../controllers/subscription.controller');

const router = Router();
router.use(authenticate);

router.post(
  '/create',
  [body('planId').notEmpty().withMessage('planId required')],
  validate,
  c.create
);
router.get('/my-subscription', c.myActive);
router.get('/my', c.mySubscriptions);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.post('/:id/pause', c.pause);
router.post('/:id/resume', c.resume);
router.post('/:id/cancel', c.cancel);

module.exports = router;
