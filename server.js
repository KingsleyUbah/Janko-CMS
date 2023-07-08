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
const authRequired = require('./middlewares/auth-required')
const checkGuest = require('./middlewares/check-guest')
const checkAPIGuest = require('./middlewares/api-guest')
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

// Setting ejs as view engine
app.set('view engine', 'ejs')

// Creating session, so we can keep the user logged in between requests
app.use(session({
    name: "mosalles.sid",
    secret: 'some secret',
    resave: false,
    saveUninitialized: false,    
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'))
app.use(express.static('public'))

// Get and save users profile details, including their image
app.post("/upload", loginRequired, upload.single("uploaded_file"), async (req, res) => {    

    const oldProfile = await Profile.findOne({owner: req.session.userID})

    // If old image starts with https, then keep the isImageExternal at true    
    let flag

    if(oldProfile.image.startsWith("https")){
        flag = true
    } else {
        flag = false
     }

    try {
        const updProfile = await Profile.findOneAndUpdate(
            {owner: req.session.userID},
            {
                bio: req.body.bio,
                location: req.body.location,
                image: req.file ? req.file.filename : oldProfile.image,
                isImageExternal: flag ? true : false
            },
            {
                new: true
            }
        )              
      
        return res.redirect('/profile/show')
    } catch(e) {        
        return res.redirect('/profile/edit')
    }
    
})

// Show user's profile details, including their own posts
app.get('/profile/show', loginRequired, async (req, res) => {
    const userProfile = await Profile.findOne({owner: req.session.userID})
    const userArticles = await Article.find({user: req.session.userID})
    
    res.render('profile/show', {profile: userProfile, articles: userArticles})
})

// Show user's profile in a form, so they can edit it
app.get('/profile/edit', loginRequired, async (req, res) => {    
    const userProfile = await Profile.findOne({owner: req.session.userID})        

    console.log(userProfile)

    res.render('profile/edit', {profile: userProfile})
})

// Renders the homepage with their articles in the CMS (if any)
app.get("/home", loginRequired, async (req, res) => {            
    const articles = await Article.find().sort({createdAt: 'desc'}).populate('user')    
    
    const profile = await Profile.findOne({owner: req.session.userID})
    const user = await User.findOne({_id: req.session.userID})
    
    res.render('articles/index', {articles: articles, userID: req.session.userID, profile: profile, name: user.name})
})

// User can only access this route if they're logged out
app.get("/register", checkGuest, (req, res) => {
    res.render('auth/register')
})

// Same! :)
app.get('/login', checkGuest, (req, res) => {
    res.render('auth/login')
})

// Get the user data, store them in the database, then sign them in!
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
        
        req.session.userID = user.id    

        res.redirect("/home")

    } catch(e) {        
        res.redirect("/register")
    }
})

// Logs the user in
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

// To log the user out, we simple delete the session
app.get('/logout', loginRequired, (req, res) => {
    delete req.session.userID
    
    res.redirect("/login")
})


/* These are the auth routes for the API. 
   The user can only use the other API endpoints after logging in!
*/
app.post("/auth/login", checkAPIGuest, async (req, res) => {    
    const {username, password} = req.body
    
    const user = await User.findOne({username: username})    

    if(!user) {
        return res.json({message: 'User does not exist. Please register first'})            
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect) {
        return res.json({message: 'Incorrect login details'})            
    }

    req.session.userID = user.id    

    res.json({message: "You're signed in! You can now use the API"})    
})

// Register an account from the API
app.post("/auth/register", checkAPIGuest, async (req, res) => {    
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

    res.json({message: "User registered! You can now use the API"})
})

// Logout from the API
app.get('/auth/logout', authRequired, (req, res) => {
    delete req.session.userID
    
    res.json({message: "You're now signed out."})
})

// Clear your database from the API
app.delete("/database", authRequired, async (req, res) => {
    try {
      const db = mongoose.connection.db;
  
      // Get all collections
      const collections = await db.listCollections().toArray();
      console.log(collections)
  
      // Create an array of collection names and drop each collection
      collections
        .map((collection) => collection.name)
        .forEach(async (collectionName) => {
          db.dropCollection(collectionName);
        });
  
        const newCollections = await db.listCollections().toArray();
        console.log(newCollections)

        res.sendStatus(200).json({message: "Databases deleted"});
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
  });

// Web routes for article-related operations
app.use('/articles', articleRouter)

// API routes for article and profile-related operations
app.use('/api/articles', apiRoutes)
app.use('/api/profile', apiProfRoutes)

app.listen(5000)