const Validator = require('fastest-validator')
const v = new Validator();
const schema = {
    username: {type: 'string', min: 3, max: 20},
    password: {type: 'string'},
    name: {type: 'string', min: 3, max: 60},
    email: {type: 'string'},
}

const checker = v.complile()
module.exports = checker