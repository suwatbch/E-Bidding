// จำลองข้อมูลการประมูล
const auctions = [
  {
    id: 1,
    title: "ประมูล iPhone 15 Pro Max",
    description: "iPhone 15 Pro Max สี Natural Titanium 256GB",
    startingPrice: 35000,
    currentPrice: 35000,
    startTime: "2024-03-20T10:00:00Z",
    endTime: "2024-03-21T10:00:00Z",
    status: "active",
    createdBy: {
      id: 1,
      username: "seller1",
      email: "seller1@example.com"
    },
    bids: [
      {
        id: 1,
        bidder: {
          id: 2,
          username: "bidder1",
          email: "bidder1@example.com"
        },
        amount: 36000,
        time: "2024-03-20T11:00:00Z"
      }
    ]
  },
  {
    id: 2,
    title: "ประมูล MacBook Pro M3",
    description: "MacBook Pro 14-inch M3 Pro 18GB RAM 512GB SSD",
    startingPrice: 65000,
    currentPrice: 67000,
    startTime: "2024-03-19T10:00:00Z",
    endTime: "2024-03-22T10:00:00Z",
    status: "active",
    createdBy: {
      id: 1,
      username: "seller1",
      email: "seller1@example.com"
    },
    bids: [
      {
        id: 2,
        bidder: {
          id: 3,
          username: "bidder2",
          email: "bidder2@example.com"
        },
        amount: 67000,
        time: "2024-03-20T12:00:00Z"
      }
    ]
  }
];

module.exports = auctions; 