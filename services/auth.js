const UserModel = require("../models/user")

const register = function(email, name, password)
{
    return UserModel.register(email, name, password);
}

module.exports = {
    register
}