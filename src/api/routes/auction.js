const express = require('express');
const router = express.Router();

// Get all auctions
router.get('/', (req, res) => {
  res.json({ message: 'Get all auctions' });
});

// Get auction by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get auction ${req.params.id}` });
});

// Create new auction
router.post('/', (req, res) => {
  res.json({ message: 'Create new auction' });
});

// Update auction
router.put('/:id', (req, res) => {
  res.json({ message: `Update auction ${req.params.id}` });
});

// Delete auction
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete auction ${req.params.id}` });
});

module.exports = router; 