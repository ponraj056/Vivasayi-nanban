const express = require('express');
const { getTickets, getTicketById, createTicket, updateTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.route('/').get(getTickets).post(createTicket);
router.route('/:id').get(getTicketById).put(updateTicket);
module.exports = router;
