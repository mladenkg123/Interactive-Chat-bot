const ConversationModel = require('../models/conversation')


const find = function()
{
    return ConversationModel.find()
}

const findById = function(id, user_id)
{
    return ConversationModel.findById(id, user_id)
}

const findByUserId = function(user_id)
{
    return ConversationModel.findByUserId(user_id)
}

const save = function(conversation)
{
    return ConversationModel.saveConversation(conversation);
}

module.exports = {
    find,
    findById,
    findByUserId,
    save
}