const express = require("express")
const router = express.Router()
const Article = require('../models/article')

router.get("/", async (req, res) => {
    try {
        const articles = await Article.find().sort({createdAt: 'desc'})
        res.json(articles)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

router.get("/:id", (req, res) => {

})

router.post("/", async (req, res, next) => {
    console.log(req.body)

    const article = new Article()
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown

    try {            
        const newArticle = await article.save()            
        return res.status(201).json(newArticle)
    } catch (e) {
        return res.status(400).json({message: e.message})
    }    

})

router.patch("/:id", (req, res) => {

})

router.delete("/:id", (req, res) => {

})

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