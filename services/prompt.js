const PromptModel = require('../models/prompt')


const find = function()
{
    return PromptModel.find()
}

const findById = function(id, user_id)
{
    return PromptModel.findById(id, user_id)
}

const findByConversationId = function(id, user_id)
{
    return PromptModel.findByConversationId(id, user_id)
}

const findOne = function(id, user_id)
{
    return PromptModel.findOne(id, user_id)
}

const save = function(prompt)
{
    return PromptModel.savePrompt(prompt);
}
module.exports = {
    find,
    findById,
    findByConversationId,
    findOne,
    save
}