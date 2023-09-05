const UserModel = require("../models/user")

const register = function(email, username, password)
{
    return UserModel.register(email, username, password);
}

module.exports = {
    register
}