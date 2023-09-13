const UserModel = require("../models/user")

const findById = function(user_id)
{
    return UserModel.findById2(user_id)
}

const setAnswersAndGrades = function(user_id, body)
{
    return UserModel.setAnswersAndGrades(user_id, body)
}

module.exports = {
    findById,
    setAnswersAndGrades
}