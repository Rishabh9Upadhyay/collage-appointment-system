const mongoose = require("mongoose");


const bookappSchema = new mongoose.Schema({
    StudentName: {
        type: String,
        required: true
    },
    TeacherName: {
        type: String,
        required: true
    },
    Day:{
        type: String,
        required: true
    },
    Time: {
        type: String,
        required: true
    }
})

const Appointment = new mongoose.model("Appontment",bookappSchema);

module.exports = Appointment;