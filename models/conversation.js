const mongoose = require('mongoose');
const ConversationSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    last_accessed: {type: Date, required: true},
    conversation_description: {type: String}
});

const ConversationModel = mongoose.model('conversation', ConversationSchema);

// Save conversation
ConversationModel.saveConversation = function (user_id) {
    const last_accessed = new Date();
    const newConversation = new ConversationModel({
        user_id: user_id,
        last_accessed: last_accessed,
        conversation_description: ''
    });
    newConversation.save();
    const modifiedData = {
        user_id: newConversation.user_id,
        conversation_id: newConversation._id,
        last_accessed: newConversation.last_accessed,
        conversation_description: newConversation.conversation_description
    };
    return { status: 200, data: modifiedData };
};

ConversationModel.modifyLastAccessedById = async function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const conversationUserId = await ConversationModel.find({ _id: new ObjectId(conversation_id) }, { user_id: 1 }).exec();
        if (conversationUserId.length == 0) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        const last_accessed = new Date();
        const updatedConversation = await ConversationModel.findByIdAndUpdate(
            conversation_id,
            { $set: { last_accessed } }, // Update only the last_accessed field
            { new: true } // This option returns the updated document
        ).exec();
        if (!updatedConversation) {
            return { status: 404, message: 'Conversation not found' };
        }

        return { status: 200 };
    } catch (error) {
        console.error("Error modifying last_accessed of conversation:", error);
        return { status: 500, message: "An error occurred while modifying last_accessed of the conversation" };
    }
};

ConversationModel.modifyConversationDescripitonById = async function (conversation_id, user_id, conversation_description) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const conversationUserId = await ConversationModel.find({ _id: new ObjectId(conversation_id) }, { user_id: 1 }).exec();
        if (conversationUserId.length == 0) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }

        const updatedConversation = await ConversationModel.findByIdAndUpdate(
            conversation_id,
            { $set: { conversation_description:conversation_description.conversation_description } }, // Update only the last_accessed field
            { new: true } // This option returns the updated document
        ).exec();
        if (!updatedConversation) {
            return { status: 404, message: 'Conversation not found' };
        }

        return { status: 200 };
    } catch (error) {
        console.error("Error modifying conversation_description of conversation:", error);
        return { status: 500, message: "An error occurred while modifying conversation_description of the conversation" };
    }
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

    const conversations = await ConversationModel.find({ user_id: new ObjectId(user_id) }, {conversation_id: 1, user_id: 1, last_accessed: 1, conversation_description: 1}).exec();
    const modifiedData = conversations.map(item => {
        const { _id, ...rest } = item.toObject(); // Use toObject() to convert Mongoose document to plain JavaScript object
        return { conversation_id: _id, ...rest };
    });
    return { status: 200, data: modifiedData };
};

ConversationModel.findById = async function (conversation_id, user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const conversationUserId = await ConversationModel.find({ _id: new ObjectId(conversation_id) }, { user_id: 1 }).exec();
        if (conversationUserId.length == 0) {
            return { status: 404, message: 'Conversation not found' };
        }
        user_id = new ObjectId(user_id);
        // Check if the obtained user_id matches the provided user_id
        if (conversationUserId[0].user_id.toString() !== user_id.toString()) {
            return { status: 403, message: 'Forbidden' };
        }
        const conversation = await ConversationModel.findOne({ conversation_id: new ObjectId(conversation_id)})
        const modifiedData = {
            conversation_id: conversation._id,
            user_id: conversation.user_id,
            last_accessed: conversation.last_accessed,
            conversation_description: conversation.conversation_description
        }
        return { status: 200, data: modifiedData };
    }
    catch {
        console.error("Error modifying conversation_description of conversation:", error);
        return { status: 500, message: "An error occurred while modifying conversation_description of the conversation" };
    }
};

module.exports = ConversationModel;
