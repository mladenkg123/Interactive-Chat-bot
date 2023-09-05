const UserModel = require("../models/user")

const register = function(email, username, password, plan, role)
{
    return UserModel.register(email, username, password, plan, role);
}

module.exports = {
    register
}