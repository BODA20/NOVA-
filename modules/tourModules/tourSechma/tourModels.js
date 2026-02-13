const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
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
    },

    duration: {
      type: Number,
    },

    priceDiscount: {
      type: Number,
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
    // Geospatial
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
        day: Number,
        description: String,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ startLocation: '2dsphere' });

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
  const pipeline = this.pipeline();
  const firstStage = pipeline[0];

  if (firstStage && firstStage.$geoNear) return;

  pipeline.unshift({ $match: { secretTour: { $ne: true } } });
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
