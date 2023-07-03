const express = require("express")
const articleRouter = require('./routes/articles')
const apiRoutes = require('./api/articles')
const apiProfRoutes = require('./api/profile')
const Article = require('./models/article')
const User = require('./models/user')
const Profile = require('./models/profile')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const loginRequired = require('./middlewares/login-required')
const multer = require('multer')
const path = require('path')
const user = require("./models/user")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

let uri = 'mongodb+srv://ubahkingsley4:tragers4@cluster0.jwite16.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(uri)
.then(() => {
    console.log("Mongoose connected")
})
.catch(() => {
    console.log("Database connection error")
})


app.set('view engine', 'ejs')

app.use(session({
    name: "mosalles.sid",
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,    
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.post("/upload", loginRequired, upload.single("uploaded_file"), async (req, res) => {    

    const oldProfile = await Profile.findOne({owner: req.session.userID})

    try {
        const updProfile = await Profile.findOneAndUpdate(
            {owner: req.session.userID},
            {
                bio: req.body.bio,
                location: req.body.location,
                image: req.file.filename ? req.file.filename : oldProfile.image
            },
            {
                new: true
            }
        )
        
        console.log(updProfile)
        return res.redirect('/profile/show')
    } catch(e) {
        console.log(e)
        return res.redirect('/profile/edit')
    }
    
})

app.get('/profile/show', loginRequired, async (req, res) => {
    const userProfile = await Profile.findOne({owner: req.session.userID})
    console.log("After saving profile")
    console.log(userProfile)    
    res.render('profile/show', {profile: userProfile})
})

app.get("/home", loginRequired, async (req, res) => {        
    
    const articles = await Article.find().sort({createdAt: 'desc'})
    console.log("Just before sessions")
    
    const profile = await Profile.findOne({owner: req.session.userID})
    const user = await User.findOne({_id: req.session.userID})

    console.log(profile)
    console.log(user)
    res.render('articles/index', {articles: articles, userID: req.session.userID, image: profile.image, name: user.name})
})

app.get("/register", (req, res) => {
    res.render('auth/register')
})

app.get('/login',  (req, res) => {
    if (req.session) {
        console.log(req.session.userID)
    }
    res.render('auth/login')
})

app.post("/register", async (req, res) => {    
    const {name, username, email, password} = req.body
    
    if(password.length < 5) {
        res.render('auth/register', {message: 'Password must be more than 5 characters'})
    }    
        
    const hashedPassword = await bcrypt.hash(password, 10)    

    try {        
    
        const user = await User.create({
            username,
            name,
            email,
            password: hashedPassword
        })            

        const newProfile = new Profile({
            bio: '',
            location: '',
            image: '',            
            owner: user
        })

        const savedProfile = await newProfile.save()

        user.profile = savedProfile
        const updateUser = await user.save()
        
        console.log(updateUser)
        
        req.session.userID = user.id    

        res.redirect("/home")

    } catch(e) {
        console.log(e)
        res.redirect("/register")
    }
})


app.post("/auth/register", async (req, res) => {    
    const {name, username, email, password} = req.body
    
    if(password.length < 5) {
        res.json({message: 'Password must be more than 5 characters'})
    }    
        
    const hashedPassword = await bcrypt.hash(password, 10)    
    
    const user = await User.create({
        username,
        name,
        email,
       password: hashedPassword
    })            

    req.session.userID = user.id

    console.log(req.session.userID)

    res.json({message: "User registered! You can now use the API"})
})

app.post("/login", async (req, res) => {    
    const {username, password} = req.body
    
    const user = await User.findOne({username: username})
    console.log(user)

    if(!user) {
        res.render("auth/register", {message: 'User does not exist'})            
    }

    console.log(password, ' ', user.password)
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect) {
        res.render("auth/register", {message: 'Incorrect login details'})            
    }

    req.session.userID = user.id

    console.log(req.session.userID)

    res.redirect("/home")    
})

app.post("/auth/login", async (req, res) => {    
    const {username, password} = req.body
    
    const user = await User.findOne({username: username})    

    if(!user) {
        return res.json({message: 'User does not exist'})            
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect) {
        return res.json({message: 'Incorrect login details'})            
    }

    req.session.userID = user.id

    console.log(req.session.userID)

    res.json({message: "You're signed in! You can now use the API"})    
})

app.get('/logout', (req, res) => {
    delete req.session.userID

    console.log(req.session.userID)
    res.redirect("/login")
})

app.get('/auth/logout', (req, res) => {
    delete req.session.userID
    
    res.json({message: "You're now signed out."})
})

app.get('/profile/edit', loginRequired, async (req, res) => {    
    const userProfile = await Profile.findOne({owner: req.session.userID})        

    console.log(userProfile)

    res.render('profile/edit', {profile: userProfile})
})

app.use('/articles', articleRouter)
app.use('/api/articles', apiRoutes)
app.use('/api/profile', apiProfRoutes)

app.listen(5000)