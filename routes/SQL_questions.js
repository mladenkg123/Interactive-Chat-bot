const SQLService = require('../services/SQL_questions')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')
const jwt = require('jsonwebtoken')

router.get('/',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('TEACHER', 'STUDENT'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload

                const SQLList = await SQLService.findByUserId(user_id);
                res.send(SQLList);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        } 
})

router.get('/:SQLList_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('TEACHER', 'STUDENT'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload

                const SQLLists = await SQLService.findById(req.params.SQLList_id, user_id);
                res.send(SQLLists);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})

router.post('/delete/:SQLList_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('TEACHER', 'STUDENT'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload

                const SQLList = await SQLService.deleteById(req.params.SQLList_id, user_id);
                res.send(SQLList);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        } 
})

router.post('/delete/user/:user_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('TEACHER', 'STUDENT'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); 
                const user_id = decodedToken._id;
                if (user_id === req.params.user_id) {
                    const SQLList = await SQLService.deleteAllByUserId(user_id);
                    res.send(SQLList);
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

router.post('/',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('TEACHER', 'STUDENT'),
    async (req, res) => {
        const jwtToken = req.headers.authorization;
        if (jwtToken.startsWith('Bearer ')) {
            const token = jwtToken.split(' ')[1]; // Extract the token without the "Bearer " prefix
            // Verify the token and extract user_id
            try {
                const decodedToken = jwt.verify(token, 'SECRET'); // Replace 'your-secret-key' with your actual secret key
                const user_id = decodedToken._id; // Assuming the user_id is stored in the JWT payload
                const SQLList = SQLService.save(user_id);
                res.send(SQLList);
            } catch (error) {
                console.error('Error decoding JWT:', error);
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
})

module.exports = router
