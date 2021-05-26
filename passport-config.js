const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user');

function initialize(passport){
    const authenticateUser = async function (email, password, done){
        try{
            const user = await User.findOne({email: email});
            if(!user){
                return done(null,false,{message: 'No user with that email'});
            }

            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }
            else{
                return done(null, false, {message: 'Incorrect password'})
            }
        }
        catch(e){
            return done(e);
        }
    }

    passport.use(new localStrategy({
        usernameField: 'email'//login je preko emaila
    }, authenticateUser ))
    passport.serializeUser(function(user,done){
        return done(null,user.id);
    })
    passport.deserializeUser(async function(id,done){
        try{
            const user = await User.findById(id);
            return done(null, user);
        }
        catch{
            return done(null, false);//vljd ovako
        }
    })
}

module.exports = initialize;
