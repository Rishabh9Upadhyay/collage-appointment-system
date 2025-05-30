const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Day: {
        type: String,
        enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    Time: {
        type: String 
    }
});

const Teacher = mongoose.model("Teacher", TeacherSchema);

module.exports = Teacher;
