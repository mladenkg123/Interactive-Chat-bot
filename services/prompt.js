const PromptModel = require('../models/prompt')


const find = function()
{
    return PromptModel.find()
}

const findById = function(id)
{
    return PromptModel.findById(id)
}

const findByUserId = function(user_id)
{
    return PromptModel.findByUserId(user_id)
}

const save = function(prompt)
{
    return PromptModel.savePrompt(prompt);
}

module.exports = {
    find,
    findById,
    findByUserId,
    save
}