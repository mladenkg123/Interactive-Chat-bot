const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const JwtExtractor = require('passport-jwt').ExtractJwt
const UserModel = require('../../models/user')

let localOptions = {
    usernameField: "email"
}

passport.use(new LocalStrategy(localOptions, async function(email, password, done){
    const user = await UserModel.findOne({email:email});

    if (!user)
    {
        //greska
        done(null,null, {
            message: "Credentials not valid!"
        })
    }
    else
    {
        const validacija = user.validatePassword(password);
        if (!validacija)
        {
            //greska
            done(null,null, {
                message: "Credentials not valid!"
            })
        }
        else
        {
            //uspesno
            done(null, user)
        }
    }
}))

const jwtOptions = {
    secretOrKey: "SECRET",
    jwtFromRequest: JwtExtractor.fromAuthHeaderAsBearerToken()
}

passport.use(new JwtStrategy(jwtOptions, async function(jwt_payload, done){
    const user = await UserModel.findById(jwt_payload._id)
    if (!user)
    {
        done(null, null ,{
            message: "Credentials not valid!"
        })
    }
    else
    {
        done(null, user)
    }

}))

passport.authorizeRoles = (...roles) => (req,res,next) => {
    req.user
    const validacija = roles.find(role=> role === req.user.getRole());
    if (validacija)
        next();
    else
    {
        res.status(403)
        return res.send("Not Authorized")
    }
}

passport.log = () => (req,res,next) => {
    console.log("Pristupio je korisnik: "+req.user.name);
    next()
}




module.exports = passport