const crypto =require('crypto');

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    admin: { type: Boolean },
    hash: { type: String},
    salt: {type: String }
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
        admin: false
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

module.exports = UserModel
