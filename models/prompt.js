const mongoose = require('mongoose')

const PromptSchema = mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"user"},
    prompt: {type: String, required: true},
    conversation_id: {type: Number, required: true}
})

const PromptModel = mongoose.model('prompt', PromptSchema)

PromptModel.savePrompt = function (prompt){
    const newPrompt = new PromptModel({
        user_id: prompt.user_id,
        prompt: prompt.prompt,
        conversation_id: prompt.conversation_id
    });
    newPrompt.save();
    return newPrompt;
}

PromptModel.findByUserId = function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    return PromptModel.find({ user_id: new ObjectId(user_id) }, { prompt: 1 , _id: 0}).exec();
};

module.exports = PromptModel
