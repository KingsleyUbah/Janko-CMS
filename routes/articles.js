const express = require("express")
const Article = require('../models/article')
const router = express.Router()
const loginRequired = require('../middlewares/login-required')

router.get('/new', loginRequired, (req, res) => {      
    return res.render('articles/new', {article: new Article() })
})

router.get('/edit/:id', loginRequired, async (req, res) => {    

    const article = await Article.findById(req.params.id)
    return res.render('articles/edit', {article: article})
})

router.get('/:slug', loginRequired, async (req, res) => {        

    const article = await Article.findOne({slug: req.params.slug})

    if(article == null) res.redirect('/')

    return res.render('articles/show', {article: article})
})

router.post('/', loginRequired, async (req, res, next) => {        

  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', loginRequired, async (req, res, next) => {        
    req.article = await Article.findById(req.params.id)    
    next()
  }, saveArticleAndRedirect('edit'))

router.delete('/:id', loginRequired, async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    
    return res.redirect('/home')
})

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        
        article.title = req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        
    
        try {            
            article = await article.save()            
            return res.redirect(`/articles/${article.slug}`)
        } catch (e) {
            return res.render(`articles/${path}`, {article: article})
        }    
    }
}

module.exports = router