const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code:{
        type: String,
        //unique: true,
        required: true
    },
    groupAdmins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    groupMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const Group = mongoose.model('Group',groupSchema);

module.exports = Group;