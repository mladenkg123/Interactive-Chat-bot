const authService = require('../services/auth')
const router = require('express').Router()

const passport = require('./config/config')


router.post('/register', async (req,res)=>{
    const token = await authService.register(req.body.email, req.body.name, req.body.password);
    if (!token)
        res.status(503)
    res.send(token)
})

router.post('/login', 
    passport.authenticate('local', {session: false}),
    (req,res)=>{
    
    res.send({json:req.user.generateJwt()})
})

module.exports = router;