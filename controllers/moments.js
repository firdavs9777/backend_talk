const path = require('path');
const asyncHandler = require('../middleware/async');
const Moment = require('../models/Moment');
const ErrorResponse = require('../utils/errorResponse');

//@desc Get all moments
//@route Get /api/v1/moments
//@access Public

exports.getMoments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc Get single moments
//@route Get /api/v1/moments/:id
//@access Public

exports.getMoment = asyncHandler(async (req, res, next) => {
  const moment = await Moment.findById(req.params.id);
  if (!moment) {
    return next(
      new ErrorResponse(`Moment not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: moment });
});

//@desc POST create Moment
//@route POST /api/v1/moments
//@access Public

exports.createMoment = asyncHandler(async (req, res, next) => {
  const moment = await Moment.findById(req.params.id);
  if (!req.body.image) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
  const file = req.body.image;
  if (file == '') {
    return next(new ErrorResponse('Please upload an image property', 400));
  }
  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an imageless than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  // Create custome file name
  file.name = `photo_${moment._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }
  });
  const updated_moment = await Moment.create(req.body);
  console.log('Image', req.body);
  res.status(200).json({ success: true, data: updated_moment });
});

//@desc Update Moment
//@route PUT /api/v1/moments/:id
//@access Private

exports.updateMoment = asyncHandler(async (req, res, next) => {
  let moment = await Moment.findById(req.params.id);
  if (!moment) {
    return next(
      new ErrorResponse(`Moment not found with id of ${req.params.id}`, 404)
    );
  }
  moment = await Moment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, data: moment });
});

//@desc Delete Moment
//@route DELETE /api/v1/moments/:id
//@access Private

exports.deleteMoment = asyncHandler(async (req, res, next) => {
  const moment = await Moment.findByIdAndDelete(req.params.id);
  if (!moment) {
    return next(
      new ErrorResponse(`Moment not found with id of ${req.params.id}`, 404)
    );
  }
  moment.remove();
  res.status(200).json({ success: true, data: {}, message: 'Moment Deleted' });
});
