// Makes sure the web user doesn't access login and register routes if still signed in

const checkAPIGuest = async (req, res, next) => {
    if(req.session && req.session.userID) {
        return res.json({message: "You're already signed in!"})
    }

    next()
}

module.exports = checkAPIGuest