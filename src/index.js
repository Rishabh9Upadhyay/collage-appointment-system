require("dotenv").config();
const express = require("express")
const app = express()
const port = process.env.PORT || 3000
require("./db/conn1")
const hbs = require("hbs")
const path = require("path")
const student = require('./models/registers')
const Teacher = require('./models/Teachers')
const Appointment = require("./models/bookapp")
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt")
const session = require("express-session")
const auth = require("./middleware/auth")
const template_path = path.join(__dirname,"../templates/views")
const partials_path = path.join(__dirname,"../templates/partials")
const static_path = path.join(__dirname,"../public")


app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(express.static(static_path))
app.set("view engine","hbs") 
app.set("views",template_path)
hbs.registerPartials(partials_path)




// Set up session middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));



app.get('/',(req, res)=>{
    if(req.session.name){
        res.render("index",{
            Name: req.session.name
        })
    }
    else{
        res.render("index")
    }
})


app.get('/schedule',auth, async (req, res) => {
    const data = await Appointment.find();
    res.render("schedule", {
        data: data,
        Name: req.session.name
    });
});


app.get('/Teacher', auth, async (req, res)=>{
    try{
        const data = await Teacher.find()
        if(req.session.name){
            res.render("time",{
                data: data,
                Name: req.session.name
            })
        }
        else{
            res.render("login",{mess1: true})
        }
    }
    catch(e){
        res.statusCode(500)
        res.send("Internal Servar Error")
        console.log("Internal Servar Error")
    }
})

app.get('/register',(req, res)=>{
    res.render("register")
})

app.get('/login',(req, res)=>{
    res.render("login")
})


app.get('/bookapp', auth, async (req, res)=>{
    const data = await Teacher.find();
        res.render("bookapp",{
            data:data,
            Name: req.session.name
    })
})




// app.post("/bookapp", async (req,res)=>{
//     if(req.session.name){
//         try{
//             const obj1 = new Appointment({
//                 StudentName: req.body.StudentName,
//                 TeacherName: req.body.TeacherName,
//                 Day: req.body.Day,
//                 Time: req.body.Time
//             })
//             await obj1.save();
//             res.render("index",{mess: true})
//         }
//         catch(e){
//             res.statusCode(500)
//             res.send("Internal Servar Error")
//             console.log("Internal Servar Error")
//         }
//     }
//     else{
//         res.render("login",{mess1: true})
//     }
// })



app.post("/bookapp", async (req, res) => {
    try {
        const obj1 = new Appointment({
            StudentName: req.body.StudentName,
            TeacherName: req.body.TeacherName,
            Day: req.body.Day,
            Time: req.body.Time
        });

        const teacher = await Teacher.findOne({ Name: obj1.TeacherName });

        if (teacher) {
            await obj1.save();
            res.render("index", { mess: true });
        } else {
            res.status(400).send("Bad Request: Teacher not found");
        }
    } catch (e) {
        console.log("Internal Server Error", e);
        res.status(500).send("Internal Server Error");
    }
});






app.post('/register1', async (req, res) => {
    try {
        const pass = req.body.Password;
        const cpass = req.body.Cpassword;

        const useremail = await student.findOne({ Email: req.body.email });

        if (!useremail) {
            if (pass === cpass) {
                const registerstudent = new student({
                    Name: req.body.Name,
                    Email: req.body.Email,
                    Gender: req.body.Gender,
                    Password: pass,
                    Cpassword: cpass
                });

                const token = await registerstudent.generateAuthToken();
                console.log("The success part jwt:"+token)

                res.cookie("jwt",token,{
                    expires: new Date(Date.now()+65000000),
                    httpOnly: true
                });

                req.session.name = req.body.Name;

                await registerstudent.save();
                res.render("index",{
                    Name: req.session.name
                });
            } else {
                res.render("register", { alert2: req.body });
            }
        } else {
            res.render("register", { alert1: req.body });
        }
    } catch (e) {
        console.log("Registration Error:", e);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/login',async (req,res)=>{
    try{
        const Email = req.body.Email;
        const Password = req.body.Password;
        const useremail = await student.findOne({Email});
        const isMatch = await bcrypt.compare(Password,useremail.Password);
        
        const token = await useremail.generateAuthToken();

        

        if(isMatch){
            res.cookie("jwt",token,{
                expires: new Date(Date.now()+65000000),
                httpOnly: true,
            })

            req.session.name = useremail.Name;
            
            res.status(200).render('index',{
                Name: req.session.name
            })
        }
        else{
            res.send("Invalid email or password")
        }
    }catch(e){
        res.status(400).send("Invalid Email or Password..........");
        console.log(e)
    }
})


app.patch("/bookapp", async (req, res) => {
    if (req.session.name) {
        try {
            const { StudentName, TeacherName, Day, Time, newDay, newTime } = req.body;
            const updated = await Appointment.updateOne(
                { StudentName, TeacherName, Day, Time },
                { $set: { Day: newDay, Time: newTime } }
            );
            if (updated.modifiedCount === 0) {
                return res.status(404).send("No matching appointment to update.");
            }
            res.status(200).send("Appointment updated successfully.");
        } catch (e) {
            console.error("Update error:", e);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(401).send("Unauthorized. Please log in.");
    }
});

app.delete("/book", async (req, res) => {
    if (req.session.name) {
        try {
            const { StudentName, TeacherName, Day, Time } = req.body;
            const result = await Appointment.deleteOne({ StudentName, TeacherName, Day, Time });
            if (result.deletedCount === 0) {
                return res.status(404).send("No matching appointment found to delete.");
            }
            res.status(200).send("Appointment deleted successfully.");
        } catch (e) {
            console.error("Delete error:", e);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(401).send("Unauthorized. Please log in.");
    }
});



app.get("/logout", auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((curElement)=>{
            return curElement.token !== req.token;
        })
        res.clearCookie("jwt");
        await req.user.save();
        res.render("index");
    }catch(e){
        console.log(e)
    }
})




app.post('/Teacher', async (req, res)=>{
    try{
        const teacher1 = new Teacher({
            Name: req.body.Name,
            Email: req.body.Email,
            Day: req.body.Day,
            Time: req.body.Time
        })
        await teacher1.save();
        res.render("time")
    }
    catch(e){
        res.statusCode(500)
        res.send("Internal Servar Error")
        console.log("Internal Servar Error")
    }
})







app.listen(port,(err)=>{
    if(err){        
        console.log(err)
    }
    else{
        console.log(`Server is listning at port number ${port}`)
    }
})
