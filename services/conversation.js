const ConversationModel = require('../models/conversation');
const PromptModel = require('../models/prompt');
const AnswerModel = require('../models/answer');

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

const modifyLastAccessedById = function(conversation_id, user_id)
{
    return ConversationModel.modifyLastAccessedById(conversation_id, user_id)
}

const modifyConversationDescripitonById = function(conversation_id, user_id, conversation_description)
{
    return ConversationModel.modifyConversationDescripitonById(conversation_id, user_id, conversation_description)
}

const deleteById = async function(conversation_id, user_id)
{
    try {
        const deletedConversation = await ConversationModel.deleteConversation(conversation_id, user_id);
        if (!deletedConversation) {
            return { status: 404, message: "Conversation not found" };
        }
        await PromptModel.deleteByConversationId(conversation_id);
        await AnswerModel.deleteByConversationId(conversation_id);
        return { status: 200, message: "Conversation deleted successfully" };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return { status: 500, message: "An error occurred while deleting the conversation" };
    }
}

const deleteAllByUserId = async function(user_id)
{
    try {
        const deletedConversation = await ConversationModel.deleteAllByUserId(user_id);
        if (!deletedConversation) {
            return { status: 404, message: "Conversation not found" };
        }
        await PromptModel.deleteAllByUserId(user_id);
        await AnswerModel.deleteAllByUserId(user_id);
        return { status: 200, message: "Conversation deleted successfully" };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return { status: 500, message: "An error occurred while deleting the conversation" };
    }
}

const save = function(conversation)
{
    return ConversationModel.saveConversation(conversation);
}

module.exports = {
    find,
    findById,
    findByUserId,
    modifyLastAccessedById,
    modifyConversationDescripitonById,
    deleteById,
    deleteAllByUserId,
    save
}
