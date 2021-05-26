const express = require('express');
const router = express.Router();

const Group = require('../models/group');
const User = require('../models/user');
const Exam = require('../models/exam');
const Result = require('../models/result');

const checkAuthenticated = require('../passport-auth').checkAuthenticated;

router.get('/', checkAuthenticated, async function(req, res){
    let userID = req.user.id;
    try{
        let adminGroups = await Group.find({groupAdmins: userID});
        let memberGroups = await Group.find({groupMembers: userID});
        res.render('allgroups', {
            adminGroups: adminGroups,
            memberGroups: memberGroups
        });
    }
    catch{
        res.redirect('/');
    }
});

router.get('/new', checkAuthenticated, async function(req,res){
    let code;
    let group;
    while(true){
        code=randomCode(6);
        group = await Group.find({code: code})
        if(group.length == 0){
            console.log('MOZE');
            break;
        }    
    }
    res.render('newgroup', {
        group: new Group(),
        code: code
    });
})

router.post('/new', checkAuthenticated, async function(req,res){
    console.log(req.body);
    const group = new Group({
        name: req.body.name,
        code: req.body.code,
        groupAdmins: req.user.id
    })
    console.log(group);
    try{
        await group.save();
        console.log('napravljena grupa');
        res.redirect('/groups');
    }
    catch{
        res.render('newgroup',{
            group: group,
            errorMessage: 'Error creating a test'
        });
        console.log('greska za grupu');
    }
})

router.put('/join/:code', checkAuthenticated, async function(req,res){
    try{
        const group = await Group.findOne({code: req.params.code});
       //console.log(group);
        if(!group){
            req.flash('info', 'Wrong code');
            res.redirect('/');
            return;
        }
        const users = group.groupAdmins.concat(group.groupMembers);
        //console.log(users);
        if(users.includes(req.user.id)){
            req.flash('info', 'You are already a member');
            res.redirect('/');
            return;
        }
        group.groupMembers.push(req.user.id);
        await group.save();
        console.log('Dodat clan u grupu');
        res.redirect(`/groups/${group.id}`);
    }   
    catch(e){
        console.log(e);
        res.redirect('/');
    }
})


router.get('/:id', checkAuthenticated, checkMember, async function(req,res){
    try{
        const group = await Group.findById(req.params.id)
                                    .populate('groupAdmins')
                                    .populate('groupMembers').exec();
        const admins = group.groupAdmins;
        const members = group.groupMembers;
        //const user = await User.findById(req.user.id);
        const results = await Result.find({user: req.user.id}).sort({exam: 'asc'}).exec();
        const exams = await Exam.find({group: group.id}).
                                    populate('test').exec();

        res.render('showgroup', {
            group: group,
            admins: admins,
            members: members,
            exams: exams,
            results: results
        })
    }
    catch{
        res.redirect('/');
    }
})


function randomCode(k){//pravi random kod od 6 slova (velikih, malih, abeceda)
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let n=chars.length;
    let code='';
    let randNum;
    for(let i=0 ; i<k ; i++){
        randNum = Math.floor(Math.random()*n);
        code+=chars[randNum];
    }
    console.log(code);

    return code;
}

async function checkMember(req,res,next){//da li je pravi user; ne moze se pristupiti grupi kojoj nije clan
    try{
        const group = await Group.findById(req.params.id);
        const users = group.groupAdmins.concat(group.groupMembers);
        /*console.log(users);*/
        if(users.includes(req.user.id))return next();
        req.flash('info', 'No permission to acces');
        res.redirect('/');
    }
    catch{
        console.log('greska');
        res.redirect('/');
    }
}

module.exports = router;