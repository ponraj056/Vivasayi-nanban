const express = require('express');
const { getTickets, getTicketById, createTicket, updateTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Require authentication for all ticket routes

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .patch(updateTicket); // We'll use PATCH for updating status/adding messages

module.exports = router;
