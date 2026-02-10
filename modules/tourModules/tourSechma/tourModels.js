const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true, // index (مش validator)
      trim: true,
    },
    slug: String,

    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },

    price: {
      type: Number,
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    maxGroupSize: {
      type: Number,
    },

    difficulty: {
      type: String,
      // enum removed
    },

    duration: {
      type: Number,
    },

    priceDiscount: {
      type: Number,
      // custom validator removed
    },

    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function () {
  this.slug = slugify(this.name || '', { lower: true });
});

tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
});

tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
