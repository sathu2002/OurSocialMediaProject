const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  campaignName: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    enum: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Google', 'Google Ads', 'TikTok', 'Email', 'Other'],
  },
  reach: {
    type: Number,
    default: 0,
  },
  impressions: {
    type: Number,
    default: 0,
  },
  engagement: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  conversions: {
    type: Number,
    default: 0,
  },
  reportMonth: {
    type: String,
    // format: 'YYYY-MM'
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analytics', analyticsSchema);
