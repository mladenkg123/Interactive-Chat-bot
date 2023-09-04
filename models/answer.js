const mongoose = require('mongoose')
const ConversationModel = require("./conversation")
const PromptModel = require("./prompt")

const AnswerSchema = mongoose.Schema({
    answer: {type: String, required: true},
    prompt_id: {type: mongoose.Schema.Types.ObjectId, ref:"prompt", required: true},
    conversation_id: {type: mongoose.Schema.Types.ObjectId, ref:"conversation", required: true}
})

const AnswerModel = mongoose.model('answer', AnswerSchema)

AnswerModel.saveAnswer = function (answer){
    const newAnswer = new AnswerModel({
        answer: answer.answer,
        prompt_id: answer.prompt_id,
        conversation_id: answer.conversation_id
    });
    const modifiedData = {
        answer: newAnswer.answer,
        prompt_id: newAnswer.prompt_id,
        conversation_id: newAnswer.conversation_id
    };
    newAnswer.save();
    return { status: 200, data: modifiedData };
}

AnswerModel.deleteByConversationId = async function (conversation_id) {
    try {
        await AnswerModel.deleteMany({ conversation_id: conversation_id }).exec();
    } catch (error) {
        console.error("Error deleting answers:", error);
    }
};

AnswerModel.deleteAllByUserId  = async function (user_id) {
    try {
        await AnswerModel.deleteMany({ user_id: user_id }).exec();
    } catch (error) {
        console.error("Error deleting answers:", error);
    }
};

AnswerModel.findByPromptId = async function (prompt_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        // Retrieve the conversation_id using the provided prompt_id
        const conversation = await PromptModel.findOne(new ObjectId(prompt_id) , { conversation_id: 1 });
        
        if (!conversation) {
            return { status: 404, message: 'Prompt not found' };
        }
        // Retrieve the user_id using the obtained conversation_id
        const conversationUserId = await ConversationModel.findOne({ _id: conversation.conversation_id }, { user_id: 1 }).exec();
        
        if (!conversationUserId) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId.user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }

        // Retrieve the answers associated with the provided prompt_id
        const answers = await AnswerModel.find({ prompt_id: new ObjectId(prompt_id) }, { answer: 1, _id: 0 }).exec();
        
        return { status: 200, data: answers };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};

AnswerModel.findByConversationId = async function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        // Retrieve the user_id using conversation_id
        const conversationUserId = await ConversationModel.findOne({ _id: conversation_id }, { user_id: 1 }).exec();
        
        if (!conversationUserId) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId.user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        // Retrieve the answers associated with the provided conversation_id
        const answers = await AnswerModel.find({ conversation_id: conversation_id } , { prompt_id: 1, answer: 1}).exec();
        if (!answers) {
            return { status: 404, message: 'Answers not found' };
        }
        const modifiedData = answers.map(item => {
            const { _id, ...rest } = item.toObject(); // Use toObject() to convert Mongoose document to plain JavaScript object
            return { answer_id: _id, ...rest };
        });
        return { status: 200, data: modifiedData };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};

module.exports = AnswerModel
