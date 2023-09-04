const crypto =require('crypto');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    admin: { type: Boolean },
    hash: { type: String},
    remaining_prompts: { type: Number },
    account_type: { type: String },
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
    if (this.admin)
        return "ADMIN";
    return "USER";
}

const UserModel = mongoose.model('user', UserSchema);

UserModel.register = async function(email, name, password)
{
    const user = new UserModel({
        email:email,
        admin: false,
        remaining_prompts: 100, 
        account_type: "free"
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

UserModel.findById = async function (user_id) {
    const ObjectId = mongoose.Types.ObjectId;
    try {
        user_id = new ObjectId(user_id);
        const user = await UserModel.findOne({ _id: user_id }, { remaining_prompts: 1 }).exec();

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

module.exports = UserModel
