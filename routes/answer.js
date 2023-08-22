const AnswerService = require('../services/answer')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')

router.get('/',
    async (req, res) => {
        const answers = await AnswerService.find()
        res.send(answers);
})

router.get('/:id',   
    async (req, res) => {
        const answer = await AnswerService.findById(req.params.id)
        res.send(answer)
})
router.get('/prompt/:prompt_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const answer = await AnswerService.findByPromptId(req.params.prompt_id)
        res.send(answer)
})
router.get('/user/:user_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const answer = await AnswerService.findByUserId(req.params.user_id)
        res.send(answer)
})
router.post('/',   
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    (req, res) => { 
        const answer = AnswerService.save(req.body)
        res.send(answer)
})

module.exports = router
