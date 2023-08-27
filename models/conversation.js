const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
});

const ConversationModel = mongoose.model('conversation', ConversationSchema);

// Save conversation
ConversationModel.saveConversation = function (conversation) {
    const newConversation = new ConversationModel({
        user_id: conversation.user_id
    });
    return newConversation.save(); // Returning the promise
};

// Find conversations by user ID
ConversationModel.findByUserId = function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    return ConversationModel.find({ user_id: new ObjectId(user_id) }).exec();
};

ConversationModel.findById = function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    return ConversationModel.findOne({ user_id: new ObjectId(user_id),  conversation_id: new ObjectId(conversation_id)});
};

module.exports = ConversationModel;
