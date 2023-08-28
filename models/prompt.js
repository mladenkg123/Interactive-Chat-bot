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
    return { status: 200, data: newPrompt };
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
        

        const prompts = await PromptModel.find({ conversation_id: conversation_id }, {prompt_id: 1, prompt: 1}).exec();
        if (!prompts) {
            return { status: 404, message: 'No prompts' };
        }
        
        const modifiedData = prompts.map(item => {
            const { _id, ...rest } = item.toObject(); // Use toObject() to convert Mongoose document to plain JavaScript object
            return { prompt_id: _id, ...rest };
        });

        return { status: 200, data: modifiedData };
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
        const prompt = await PromptModel.findOne(new ObjectId(prompt_id), {prompt_id: 1, prompt: 1});

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
        const modifiedData = {
            prompt_id: prompt._id,
            prompt: prompt.prompt
        };

        return { status: 200, data: modifiedData };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};

module.exports = PromptModel
