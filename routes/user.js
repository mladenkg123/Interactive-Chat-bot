const UserService = require('../services/user')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')
const jwt = require('jsonwebtoken')

router.get('/:user_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('ADMIN', 'USER', 'TEACHER', 'STUDENT'),
    async (req,res)=>{
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload
                if(user_id === req.params.user_id) {
                    const user = await UserService.findById(user_id);
                    res.send(user);
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