const questionsModel = require('../models/questions');

const find = function()
{
    return questionsModel.find()
}

const modifyQuestionsById = function(questions_id, questions) {
    return questionsModel.modifyQuestionsById(questions_id, questions);
}

const save = function(questions)
{
    return questionsModel.savequestions(questions);
}

module.exports = {
    find,
    modifyQuestionsById,
    save
}
