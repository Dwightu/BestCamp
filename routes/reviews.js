const express = require('express');
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schema');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



//POST /campgrounds/:id/reviews 提交一个review
router.post('/', validateReview, isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//DELETE 删除某一个id的review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);

}))

module.exports = router;