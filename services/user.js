const UserModel = require("../models/user")

const findById = function(user_id)
{
    return UserModel.findById(user_id)
}

module.exports = {
    findById
}