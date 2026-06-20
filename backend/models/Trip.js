import mongoose from 'mongoose';

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    activities: [{ type: String }],
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    tier: String, // Budget Friendly / Mid Range / Luxury
    note: String,
  },
  { _id: false }
);

const packingItemSchema = new mongoose.Schema(
  {
    item: String,
    checked: { type: Boolean, default: false },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true, trim: true, maxlength: 100 },
    numDays: { type: Number, required: true, min: 1, max: 30 },
    budgetType: { type: String, enum: ['low', 'medium', 'high'], required: true },
    interests: [{ type: String }],

    days: [daySchema],
    budgetEstimate: {
      flights: Number,
      accommodation: Number,
      food: Number,
      activities: Number,
      total: Number,
    },
    hotelSuggestions: [hotelSchema],
    packingList: [packingItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
