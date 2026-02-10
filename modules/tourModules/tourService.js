const Tour = require('./tourSechma/tourModels');
const APIFeatures = require('./../../common/utils/apiFeatures');

exports.getAllTours = async (query) => {
  const features = new APIFeatures(Tour.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  return tours;
};

exports.getTour = async (id) => {
  const tour = await Tour.findById(id);
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
