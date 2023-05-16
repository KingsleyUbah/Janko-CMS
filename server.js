const express = require("express")
const articleRouter = require('./routes/articles')
const Article = require('./models/article')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const app = express()

let uri = 'mongodb+srv://ubahkingsley4:tragers4@cluster0.jwite16.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(uri)
    .then(() => {
        console.log("Mongo DB connected")
    })
    .catch((e) => {
        console.log(e)
    })

app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'))

app.get("/", async (req, res) => {
    const articles = await Article.find().sort({createdAt: 'desc'})
    console.log(articles)

    res.render('articles/index', {articles: articles})
})

app.use('/articles', articleRouter)

app.listen(5000)