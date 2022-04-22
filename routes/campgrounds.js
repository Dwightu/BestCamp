const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');






//展示所有的东西
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
}));

//创建新东西
router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    res.render('campground/new');
}))
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))


//展示特定id的东西
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id).populate(
        {
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }
    ).populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campground/show', { campground })
});

//编辑东西
router.get('/:id/edit', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Sorry Cannot find that campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render('campground/edit', { campground })
});
router.put('/:id', isLoggedIn, validateCampground, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//删除新东西
router.delete('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
})

module.exports = router;