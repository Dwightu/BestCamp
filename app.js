const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Mongo CONNECTION OPEN!!!")
}).catch(err => {
    console.log("OH NO mongo ERROR!!!!")
    console.log(err)
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home')
})

//展示所有的东西
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
}));

//创建新东西
app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campground/new');
}))
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground.id}`);

}))


//展示特定id的东西
app.get('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render('campground/show', { campground })
});

//编辑东西
app.get('/campgrounds/:id/edit', async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render('campground/edit', { campground })
});
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
})


//删除新东西
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

//所有找不到路由的界面
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(8000, () => {
    console.log('Serving on Port 8000');
})