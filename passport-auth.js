function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    req.flash('info', 'You are not logged in');
    res.redirect('/');
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    next();
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
};