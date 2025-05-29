const express = require('express');
const router = express.Router();
const auctions = require('../data/auctions');

// Get all auctions
router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = auctions.find(a => a.id === parseInt(req.params.id));
    
    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found'
      });
    }

    res.json({
      status: 'success',
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new auction
router.post('/', async (req, res) => {
  try {
    const newAuction = {
      id: auctions.length + 1,
      ...req.body,
      currentPrice: req.body.startingPrice,
      status: 'active',
      bids: []
    };

    auctions.push(newAuction);
    
    res.status(201).json({
      status: 'success',
      data: newAuction
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Place a bid
router.post('/:id/bid', async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = auctions.find(a => a.id === parseInt(req.params.id));

    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found'
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Auction is not active'
      });
    }

    if (amount <= auction.currentPrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Bid amount must be higher than current price'
      });
    }

    const newBid = {
      id: auction.bids.length + 1,
      bidder: {
        id: 1, // จำลอง user ID
        username: 'current_user',
        email: 'user@example.com'
      },
      amount: amount,
      time: new Date().toISOString()
    };

    auction.bids.push(newBid);
    auction.currentPrice = amount;

    // Emit socket event for real-time update
    req.app.get('io').emit('auction-update', {
      auctionId: auction.id,
      currentPrice: amount,
      lastBidder: newBid.bidder.username
    });

    res.json({
      status: 'success',
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update auction
router.put('/:id', async (req, res) => {
  try {
    const auctionIndex = auctions.findIndex(a => a.id === parseInt(req.params.id));

    if (auctionIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found'
      });
    }

    // จำลองการตรวจสอบเจ้าของ
    if (auctions[auctionIndex].createdBy.id !== 1) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this auction'
      });
    }

    const updatedAuction = {
      ...auctions[auctionIndex],
      ...req.body
    };

    auctions[auctionIndex] = updatedAuction;

    res.json({
      status: 'success',
      data: updatedAuction
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete auction
router.delete('/:id', async (req, res) => {
  try {
    const auctionIndex = auctions.findIndex(a => a.id === parseInt(req.params.id));

    if (auctionIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found'
      });
    }

    // จำลองการตรวจสอบเจ้าของ
    if (auctions[auctionIndex].createdBy.id !== 1) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this auction'
      });
    }

    auctions.splice(auctionIndex, 1);

    res.json({
      status: 'success',
      message: 'Auction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Log notification data
router.post('/notification', (req, res) => {
  try {
    const notificationData = req.body;
    console.log('📨 Notification received:', {
      timestamp: new Date().toISOString(),
      data: notificationData
    });

    res.json({
      status: 'success',
      message: 'Notification logged successfully',
      data: notificationData
    });
  } catch (error) {
    console.error('❌ Error logging notification:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 