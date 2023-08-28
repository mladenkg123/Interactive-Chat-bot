const AnswerModel = require('../models/answer')


const find = function()
{
    return AnswerModel.find()
}

const findById = function(id)
{
    return AnswerModel.findById(id)
}

const findByPromptId = function(prompt_id, user_id)
{
    return AnswerModel.findByPromptId(prompt_id, user_id)
}

const findByConversationId = function(prompt_id, user_id)
{
    return AnswerModel.findByConversationId(prompt_id, user_id)
}

const save = function(answer)
{
    return AnswerModel.saveAnswer(answer);
}

module.exports = {
    find,
    findById,
    findByPromptId,
    findByConversationId,
    save
}