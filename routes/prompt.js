const PromptService = require('../services/prompt')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')
const jwt = require('jsonwebtoken')

router.get('/',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN'),
    async (req, res) => {
        const prompts = await PromptService.find()
        res.send(prompts);
})

router.get('/:id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload
                const prompt = await PromptService.findById(req.params.id, user_id);
                res.send(prompt);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})

router.get('/conversation/:conversation_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload
                const prompts = await PromptService.findByConversationId(req.params.conversation_id, user_id);
                res.send(prompts);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})

router.post('/',   
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload
                if(user_id === req.body.user_id) {
                    const prompt = await PromptService.save(req.body, user_id);
                    res.send(prompt);
                }
                else {
                    res.status(401).send('Unauthorized');
                }
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})

module.exports = router
