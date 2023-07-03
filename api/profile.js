const express = require("express")
const router = express.Router()
const Profile = require('../models/profile')
const authRequired = require('../middlewares/auth-required')

router.get("/details", authRequired, async (req, res) => {
    try {
        const userProfile = await Profile.findOne({owner: req.session.userID})
        res.json(userProfile)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

router.post("/edit", authRequired, async (req, res) => {    
    try {
        const updProfile = await Profile.findOneAndUpdate(
            {owner: req.session.userID},
            {
                bio: req.body.bio,
                location: req.body.location,
                image: req.body.image,
                isImageExternal: true
            },
            {
                new: true
            }
        )

        res.json(updProfile)
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

module.exports = router