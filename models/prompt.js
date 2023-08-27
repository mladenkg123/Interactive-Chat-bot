const mongoose = require('mongoose')
const ConversationModel = require("./conversation")

const PromptSchema = mongoose.Schema({
    prompt: {type: String, required: true},
    conversation_id: {type: mongoose.Schema.Types.ObjectId, ref:"conversation", required: true}
})

const PromptModel = mongoose.model('prompt', PromptSchema)

PromptModel.savePrompt = function (prompt){
    const newPrompt = new PromptModel({
        prompt: prompt.prompt,
        conversation_id: prompt.conversation_id
    });
    newPrompt.save();
    return newPrompt;
}

PromptModel.findByConversationId = async function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        // Retrieve the user_id using the obtained conversation_id
        const conversationUserId = await ConversationModel.find({ conversation_id: conversation_id }, { user_id: 1 }).exec();
        if (!conversationUserId) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        
        return { status: 200, data: conversationUserId };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};


PromptModel.findById = async function (prompt_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        // Retrieve the conversation_id using the provided prompt_id
        const prompt = await PromptModel.findOne(new ObjectId(prompt_id));

        if (!prompt) {
            return { status: 404, message: 'Prompt not found' };
        }
        // Retrieve the user_id using the obtained conversation_id
        const conversationUserId = await ConversationModel.findOne({ conversation_id: prompt.conversation_id }, { user_id: 1 }).exec();
        if (!conversationUserId) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId.user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        
        return { status: 200, data: prompt };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};

module.exports = PromptModel
