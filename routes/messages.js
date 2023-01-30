const express = require('express');
const Message = require('../models/Message');
const {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage
} = require('../controllers/messages');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(advancedResults(Message, ''), getMessages)
  .post(createMessage);
router.route('/:id').put(updateMessage).delete(deleteMessage);
module.exports = router;
