const questionservice = require('../services/questions')
const express = require('express')
const router = express.Router()
const passport = require('./config/config')
const jwt = require('jsonwebtoken')

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    passport.authorizeRoles('TEACHER', 'STUDENT'),
    async (req, res) => {
      // Check if any questions exist
      const existingQuestions = await questionservice.find();
  
      if (existingQuestions.length === 0) {
        // If no questions exist, create a default question
        const defaultQuestion = [""];
  
        // Create the default question and add it to the database
        await questionservice.save(defaultQuestion);
  
        // Fetch the questions again
        const questions = await questionservice.find();
        res.send(questions);
      } else {
        // Questions exist, send them as a response
        res.send(existingQuestions);
      }
    }
  );

router.patch('/:questions_id',
    passport.authenticate('jwt', {session: false}),
    passport.authorizeRoles('TEACHER'),
    async (req, res) => {
      const questions = questionservice.modifyQuestionsById(req.params.questions_id, req.body);
      res.send(questions);
})

module.exports = router
