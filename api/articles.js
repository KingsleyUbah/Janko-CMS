const express = require("express")
const router = express.Router()
const Article = require('../models/article')
const authRequired = require('../middlewares/auth-required')

router.get("/", authRequired, async (req, res) => {
    try {
        const articles = await Article.find().sort({createdAt: 'desc'})
        res.json(articles)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

router.get("/:id", authRequired, getArticle, (req, res) => {
    res.json(res.article)
})

router.post("/", authRequired, async (req, res, next) => {
    console.log(req.body)
    req.article = new Article()

    next()
}, saveArticle())

router.patch("/:id", authRequired, getArticle, async (req, res) => {
    if(req.body.title != null) {
        res.article.title = req.body.title
    }
    if(req.body.description != null) {
        res.article.description = req.body.description
    }
    if(req.body.markdown != null) {
        res.article.markdown = req.body.markdown
    }

    try {
        const updatedArticle = await res.article.save()
        res.json(updatedArticle)
    } catch (e) {
        res.status(400).json({message: e.message})
    }
})

router.delete("/:id", authRequired, getArticle, async (req, res) => {
    try {
        await Article.deleteOne(res.article)
        res.json({message: "Deleted Subscriber"})
    } catch(e) {
        res.status(500).json({message: e.message})
    }
})

async function getArticle(req,res, next) {
    let article

    try {
        article = await Article.findById(req.params.id)
        if(article == null ) {
            return res.status(404).json({message: "Cannot find subsriber"})
        }
    } catch(e) {
        return res.status(500).json({message: e.message})
    }

    res.article = article
    next()
}

function saveArticle() {
    return async (req, res) => {
        let article = req.article
        
        console.log(req.body)
        article.title = req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        
    
        try {            
            const newArticle = await article.save()            
            return res.status(201).json(newArticle)
        } catch (e) {
            return res.status(400).json({message: e.message})
        }    
    }
}

module.exports = router