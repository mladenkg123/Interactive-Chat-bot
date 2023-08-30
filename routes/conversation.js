const ConversationService = require('../services/conversation')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')
const jwt = require('jsonwebtoken')

router.get('/',
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

                const conversations = await ConversationService.findByUserId(user_id);
                res.send(conversations);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        } 
})

router.post('/delete/:conversation_id',
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

                const conversation = await ConversationService.deleteById(req.params.conversation_id, user_id);
                res.send(conversation);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        } 
})

/*
router.get('/:id',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload

                const conversations = await ConversationService.findById(req.params.conversation_id, user_id);
                res.send(conversations);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})
*/
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
                const conversation = ConversationService.save(user_id);
                res.send(conversation);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})

module.exports = router
