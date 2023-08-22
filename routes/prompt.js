const PromptService = require('../services/prompt')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')

router.get('/',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const prompts = await PromptService.find()
        res.send(prompts);
})

router.get('/:id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const prompt = await PromptService.findById(req.params.id)
        res.send(prompt)
})

router.get('/user/:user_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const prompt = await PromptService.findByUserId(req.params.user_id)
        res.send(prompt)
})

router.post('/',   
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    (req, res) => { 
        const prompt = PromptService.save(req.body)
        res.send(prompt)
})

module.exports = router
