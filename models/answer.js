const mongoose = require('mongoose')

const AnswerSchema = mongoose.Schema({
    answer: {type: String, required: true},
    prompt_id: {type: mongoose.Schema.Types.ObjectId, ref:"prompt"},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"user"}
})

const AnswerModel = mongoose.model('answer', AnswerSchema)

AnswerModel.saveAnswer = function (answer){
    const newAnswer = new AnswerModel({
        answer: answer.answer,
        prompt_id: answer.prompt_id,
        user_id: answer.user_id
    });
    newAnswer.save();
    return newAnswer;
}

AnswerModel.findByPromptId = function (prompt_id) {
    const ObjectId = mongoose.Types.ObjectId;
    return AnswerModel.find({ prompt_id: new ObjectId(prompt_id) }, { answer: 1, _id: 0}).exec();
};

AnswerModel.findByUserId = function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    return AnswerModel.find({ user_id: new ObjectId(user_id) }, { answer: 1, _id: 0}).exec();
};

module.exports = AnswerModel
