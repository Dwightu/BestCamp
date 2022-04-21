const express = require('express');
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn } = require('../middleware')

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schema');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



//POST /campgrounds/:id/reviews 提交一个review
router.post('/', validateReview, isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//DELETE 删除某一个id的review
router.delete('/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;