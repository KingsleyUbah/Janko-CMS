const express = require("express")
const articleRouter = require('./routes/articles')
const apiRoutes = require('./api/articles')
const Article = require('./models/article')
const User = require('./models/user')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()
const loginRequired = require('./middlewares/login-required')
// const registerValidator = require('./validators/register')


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

app.get("/home", loginRequired, async (req, res) => {        
    
    const articles = await Article.find().sort({createdAt: 'desc'})

    res.render('articles/index', {articles: articles})
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
    
    const user = await User.create({
        username,
        name,
        email,
       password: hashedPassword
    })        

    console.log(user)

    req.session.userID = user.id

    console.log(req.session.userID)

    res.redirect("/home")
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

app.get('/logout', (req, res) => {
    delete req.session.userID

    console.log(req.session.userID)
    res.redirect("/login")
})

app.use('/articles', articleRouter)
app.use('/api/articles', apiRoutes)

app.listen(5000)