const express = require('express');
const router = express.Router();
const {
  createComplaint, getMyComplaints, getAllComplaints, updateComplaint
} = require('../controllers/complaintController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

router.get('/', protect, admin, getAllComplaints);
router.put('/:id', protect, admin, updateComplaint);

module.exports = router;
