const Tour = require('./tour.model');
const ApiFeatures = require('../../utils/apiFeatures');

exports.getAllTours = async (queryStr) => {
  const features = new ApiFeatures(Tour.find(), queryStr)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  return tours;
};

exports.getTour = async (id) => {
  const tour = await Tour.findById(id).populate('reviews');
  return tour;
};

exports.createTour = async (tourData) => {
  const newTour = await Tour.create(tourData);
  return newTour;
};

exports.updateTour = async (id, updateData) => {
  const updatedTour = await Tour.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return updatedTour;
};

exports.deleteTour = async (id) => {
  const deletedTour = await Tour.findByIdAndDelete(id);
  return deletedTour;
};

exports.getToursWithin = async ({ distance, lat, lng, unit }) => {
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  return tours;
};

exports.getDistances = async ({ lat, lng, unit }) => {
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  return distances;
};
