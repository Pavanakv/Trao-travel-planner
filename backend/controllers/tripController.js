import Trip from '../models/Trip.js';
import * as llm from '../services/llmService.js';
import { sendError } from '../utils/errors.js';

const BUDGET_TYPES = ['low', 'medium', 'high'];
const MAX_DAYS = 30;

// Shared validation for trip creation - also used by callers that build a
// trip from scratch. Returns an error string, or null if valid.
function validateTripInput({ destination, numDays, budgetType, interests }) {
  if (typeof destination !== 'string' || !destination.trim()) {
    return 'destination is required';
  }
  if (destination.trim().length > 100) {
    return 'destination is too long';
  }

  const days = Number(numDays);
  if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
    return `numDays must be a whole number between 1 and ${MAX_DAYS}`;
  }

  if (!BUDGET_TYPES.includes(budgetType)) {
    return `budgetType must be one of: ${BUDGET_TYPES.join(', ')}`;
  }

  if (interests !== undefined) {
    if (!Array.isArray(interests) || !interests.every((i) => typeof i === 'string')) {
      return 'interests must be an array of strings';
    }
    if (interests.length > 10) {
      return 'too many interests';
    }
  }

  return null;
}

export async function createTrip(req, res) {
  try {
    const { destination, numDays, budgetType, interests } = req.body;

    const validationError = validateTripInput({ destination, numDays, budgetType, interests });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const cleanDestination = destination.trim();
    const cleanDays = Number(numDays);
    const cleanInterests = interests || [];

    let generated = { days: [], budgetEstimate: null, hotelSuggestions: [], packingList: [] };
    let generationError = null;

    try {
      generated = await llm.generateTripPlan({
        destination: cleanDestination,
        numDays: cleanDays,
        budgetType,
        interests: cleanInterests,
      });
    } catch (err) {
      console.error('Trip generation failed:', err.message);
      generationError = 'AI generation failed. You can retry from the trip page.';
    }

    const trip = await Trip.create({
      userId: req.userId,
      destination: cleanDestination,
      numDays: cleanDays,
      budgetType,
      interests: cleanInterests,
      days: generated.days,
      budgetEstimate: generated.budgetEstimate,
      hotelSuggestions: generated.hotelSuggestions,
      packingList: generated.packingList,
    });

    res.status(201).json({ trip, generationError });
  } catch (err) {
    sendError(res, 500, 'Failed to create trip', err);
  }
}

export async function listTrips(req, res) {
  try {
    const trips = await Trip.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ trips });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch trips', err);
  }
}

export async function getTrip(req, res) {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ trip });
  } catch (err) {
    sendError(res, 500, 'Failed to fetch trip', err);
  }
}

export async function deleteTrip(req, res) {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    sendError(res, 500, 'Failed to delete trip', err);
  }
}

// Retry/refresh the entire AI-generated plan (itinerary, budget, hotels, packing list).
// Used both as a manual "Regenerate plan" action and as the retry path if
// generation failed when the trip was first created.
export async function regeneratePlan(req, res) {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const generated = await llm.generateTripPlan({
      destination: trip.destination,
      numDays: trip.numDays,
      budgetType: trip.budgetType,
      interests: trip.interests,
    });

    trip.days = generated.days;
    trip.budgetEstimate = generated.budgetEstimate;
    trip.hotelSuggestions = generated.hotelSuggestions;
    trip.packingList = generated.packingList;
    await trip.save();

    res.json({ trip });
  } catch (err) {
    sendError(res, 502, 'AI plan generation failed', err);
  }
}

// Regenerate a single day based on a free-text instruction, e.g.
// "more outdoor activities" - leaves every other day untouched.
export async function regenerateDay(req, res) {
  try {
    const { dayNumber } = req.params;
    const { instruction } = req.body;

    if (typeof instruction !== 'string' || !instruction.trim()) {
      return res.status(400).json({ message: 'instruction is required' });
    }
    if (instruction.length > 300) {
      return res.status(400).json({ message: 'instruction is too long' });
    }

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const dayIndex = trip.days.findIndex((d) => d.dayNumber === Number(dayNumber));
    if (dayIndex === -1) {
      return res.status(404).json({ message: 'Day not found on this trip' });
    }

    const result = await llm.regenerateDay({
      destination: trip.destination,
      dayNumber: Number(dayNumber),
      totalDays: trip.numDays,
      budgetType: trip.budgetType,
      interests: trip.interests,
      instruction: instruction.trim(),
    });

    trip.days[dayIndex].activities = result.activities;
    await trip.save();

    res.json({ trip });
  } catch (err) {
    sendError(res, 502, 'Failed to regenerate day', err);
  }
}

// Add or remove a single activity from a specific day - no AI call needed,
// this is direct user editing of the itinerary.
export async function updateDayActivities(req, res) {
  try {
    const { dayNumber } = req.params;
    const { action, activity, activityIndex } = req.body;

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const day = trip.days.find((d) => d.dayNumber === Number(dayNumber));
    if (!day) {
      return res.status(404).json({ message: 'Day not found on this trip' });
    }

    if (action === 'add') {
      if (typeof activity !== 'string' || !activity.trim()) {
        return res.status(400).json({ message: 'activity text is required to add' });
      }
      if (activity.length > 200) {
        return res.status(400).json({ message: 'activity text is too long' });
      }
      day.activities.push(activity.trim());
    } else if (action === 'remove') {
      if (typeof activityIndex !== 'number' || !day.activities[activityIndex]) {
        return res.status(400).json({ message: 'valid activityIndex is required to remove' });
      }
      day.activities.splice(activityIndex, 1);
    } else {
      return res.status(400).json({ message: "action must be 'add' or 'remove'" });
    }

    await trip.save();
    res.json({ trip });
  } catch (err) {
    sendError(res, 500, 'Failed to update day', err);
  }
}

// Toggle a packing list item checked/unchecked.
export async function togglePackingItem(req, res) {
  try {
    const { index } = req.params;

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const item = trip.packingList[index];
    if (!item) {
      return res.status(404).json({ message: 'Packing item not found' });
    }

    item.checked = !item.checked;
    await trip.save();
    res.json({ trip });
  } catch (err) {
    sendError(res, 500, 'Failed to update packing item', err);
  }
}

// Manually add a packing list item (separate from the AI-generated ones).
export async function addPackingItem(req, res) {
  try {
    const { item } = req.body;
    if (typeof item !== 'string' || !item.trim()) {
      return res.status(400).json({ message: 'item text is required' });
    }
    if (item.length > 100) {
      return res.status(400).json({ message: 'item text is too long' });
    }

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.packingList.push({ item: item.trim(), checked: false });
    await trip.save();
    res.json({ trip });
  } catch (err) {
    sendError(res, 500, 'Failed to add packing item', err);
  }
}
