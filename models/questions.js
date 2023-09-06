const mongoose = require('mongoose');
const questionsSchema = mongoose.Schema({
    questions: { type: Array }
});

const questionsModel = mongoose.model('questions', questionsSchema);

questionsModel.savequestions = function (questions) {
    const newquestion = new questionsModel({
        questions: questions
    });
    newquestion.save();
    const modifiedData = {
        questions_id: newquestion._id,
        questions: newquestion.questions,
    };
    return { status: 200, data: modifiedData };
};

questionsModel.modifyQuestionsById = async function (questions_id, questions) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        const questions1 = await questionsModel.find({ _id: new ObjectId(questions_id) }, { questions: 1 }).exec();
        if (questions1.length == 0) {
            return { status: 404, message: 'questions not found' };
        }
        const updatedquestions = await questionsModel.findByIdAndUpdate(
            questions_id,
            { $set: { questions:questions.questions } },
            { new: true }
        ).exec();
        if (!updatedquestions) {
            return { status: 404, message: 'questions not found' };
        }

        return { status: 200 };
    } catch (error) {
        console.error("Error modifying questions of questions:", error);
        return { status: 500, message: "An error occurred while modifying questions of the questions" };
    }
};

module.exports = questionsModel;
