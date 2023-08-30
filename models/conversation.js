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
    newConversation.save();
    
    const modifiedData = {
        user_id: newConversation.user_id,
        conversation_id: newConversation._id
    };
    return { status: 200, data: modifiedData };
};

ConversationModel.deleteConversation = async function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const conversationUserId = await ConversationModel.find({ _id: new ObjectId(conversation_id) }, { user_id: 1 }).exec();
        if (!conversationUserId) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        const deletedConversation = await ConversationModel.findByIdAndDelete(conversation_id).exec();
        if (!deletedConversation) {
            return { status: 404, message: "Conversation not found" };
        }
        return { status: 200, message: "Conversation deleted successfully" };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return { status: 500, message: "An error occurred while deleting the conversation" };
    }
};

// Find conversations by user ID
ConversationModel.findByUserId = async function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;

    const conversations = await ConversationModel.find({ user_id: new ObjectId(user_id) }, {conversation_id: 1}).exec();
    const modifiedData = conversations.map(item => {
        const { _id, ...rest } = item.toObject(); // Use toObject() to convert Mongoose document to plain JavaScript object
        return { conversation_id: _id, ...rest };
    });
    return { status: 200, data: modifiedData };
};
/*
ConversationModel.findById = function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    return ConversationModel.findOne({ user_id: new ObjectId(user_id),  conversation_id: new ObjectId(conversation_id)});
};
*/

module.exports = ConversationModel;
