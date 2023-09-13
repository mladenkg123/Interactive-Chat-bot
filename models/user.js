const crypto =require('crypto');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: { type: String, required: true, unique: true},
    role: { type: String, required: true },
    hash: { type: String },
    remaining_prompts: { type: Number, required: true },
    answers_and_grades: { type: Array, required: true },
    account_type: { type: String, required: true },
    salt: { type: String }
})

UserSchema.methods.savePassword = function (password)
{
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 100000, 64, 'sha256').toString('hex');
}

UserSchema.methods.validatePassword = function (password)
{
    const hash = crypto.pbkdf2Sync(password, this.salt, 100000, 64, "sha256").toString('hex')
    return hash === this.hash;
}

UserSchema.methods.generateJwt = function()
{
    let expire = new Date();
    expire.setDate(expire.getDate()+7);

    return jwt.sign({
        _id: this._id,
        expire: parseInt(expire.getTime()/1000)
    }, "SECRET")
}

UserSchema.methods.getRole = function()
{
    return this.role;
}

const UserModel = mongoose.model('user', UserSchema);

UserModel.register = async function(email, username, password, plan, role)
{
    let remaining_prompts = 0;
    if(role == "USER") {
        if(plan == "free") {
            remaining_prompts = 100;
        }
        else if(plan == "pro") {
            remaining_prompts = 5000;
        }
        else if(plan == "business") {
            remaining_prompts = Number.MAX_SAFE_INTEGER;
        }
    }
    else if(role == "ADMIN") {
        remaining_prompts = Number.MAX_SAFE_INTEGER;
    }
    else if(role == "STUDENT") {
        remaining_prompts = Number.MAX_SAFE_INTEGER;
    }
    else if(role == "TEACHER") {
        remaining_prompts = Number.MAX_SAFE_INTEGER;
    }
    const user = new UserModel({
        email:email,
        username:username,
        role: role,
        account_type: plan,
        remaining_prompts: remaining_prompts,
        answers_and_grades: []
    })
    user.savePassword(password)
    try
    {
        await user.save();
        return user.generateJwt();
    }
    catch
    {
        return null;
    }
}

UserModel.findById2 = async function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        user_id = new ObjectId(user_id);
        const user = await UserModel.findOne({ _id: user_id }, { remaining_prompts: 1, username: 1, role: 1, answers_and_grades: 1 }).exec();
        const modifiedData = {
            user_id: user._id,
            remaining_prompts: user.remaining_prompts,
            username: user.username,
            role: user.role,
            answers_and_grades: user.answers_and_grades
        };

        return { status: 200, data: modifiedData };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};


UserModel.reducePrompts = async function (user_id) {
    try {
        const ObjectId = mongoose.Types.ObjectId;
        user_id = new ObjectId(user_id);
        const user = await UserModel.findOne({ _id: user_id });

        if (!user) {
            return { status: 404, message: 'User not found' };
        }

        if (user.remaining_prompts <= 0) {
            return { status: 400, message: 'No remaining prompts to reduce' };
        }

        user.remaining_prompts -= 1;

        await user.save();

        const modifiedData = {
            user_id: user._id,
            remaining_prompts: user.remaining_prompts
        };

        return { status: 200, data: modifiedData };
    } catch (error) {
        // Handle other errors gracefully
        console.log(error);
        return { status: 500, message: 'Internal Server Error' };
    }
};

UserModel.setAnswersAndGrades = async function (user_id, body) {
    const answers_and_grades = {"user_answer": body.user_answer, "bot_answer": body.bot_answer};
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            user_id,
            { $set: { [`answers_and_grades.${body.index}`]: answers_and_grades } },
            { new: true }
        ).exec();
        if (!updatedUser) {
            return { status: 404, message: 'User not found' };
        }

        return { status: 200 };
    } catch (error) {
        console.error("Error modifying User:", error);
        return { status: 500, message: "An error occurred while modifying User" };
    }
};

module.exports = UserModel
