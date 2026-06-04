const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const userController = require('../controllers/userController');

const router = express.Router();
router.use(auth);

router.get('/me', userController.getProfile);
router.put(
  '/me',
  [body('name').optional().notEmpty(), body('profile').optional().isObject()],
  validate,
  userController.updateProfile
);

module.exports = router;
