const AnswerService = require('../services/answer')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')
const jwt = require('jsonwebtoken')

/*
const restrictToAllowedIP = (req, res, next) => {
    const clientIP = req.ip; // Get the client's IP address
    if (clientIP === allowedIP) {
        next(); // Allow request to proceed
    } else {
        res.status(403).send('Forbidden'); // Reject request from other IPs
    }
};
*/
router.get('/',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN'),
    async (req, res) => {
        const answers = await AnswerService.find()
        res.send(answers);
})


router.get('/prompt/:prompt_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const jwtToken = req.headers.authorization;
    if (jwtToken.startsWith('Bearer ')) {
        const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
        // Verify the token and extract user_id
        try {
            const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
            const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload

            const answer = await AnswerService.findByPromptId(req.params.prompt_id, user_id);
            res.send(answer);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            res.status(401).send('Unauthorized');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});
router.post('/',
    //restrictToAllowedIP,
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER'),
    (req, res) => { 
        const answer = AnswerService.save(req.body)
        res.send(answer)
})

module.exports = router
