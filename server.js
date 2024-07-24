/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Su Myat Pwint Soe Student ID: 160255238 Date:7/26/2024
*
*  Online (vercel) Link: https://assignment-5-smpsoe1.vercel.app/
*
********************************************************************************/


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const exphbs = require('express-handlebars');
var app = express();
var path = require("path");
var collegeData = require("./modules/collegeData");

// Set up Handlebars view engine
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware to set activeRoute
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Middleware for static files and URL encoding
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

app.get('/students', (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course).then(data => {
            res.render('students', { students: data });
        }).catch(err => {
            res.render('students', { message: "no results" });
        });
    } else {
        collegeData.getAllStudents().then(data => {
            res.render('students', { students: data });
        }).catch(err => {
            res.render('students', { message: "no results" });
        });
    }
});

app.get('/courses', (req, res) => {
    collegeData.getCourses().then(data => {
        res.render('courses', { courses: data });
    }).catch(err => {
        res.render('courses', { message: "no results" });
    });
});

app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id).then(data => {
        res.render('course', { course: data });
    }).catch(err => {
        res.render('course', { message: "no results" });
    });
});

//assignment5
app.get('/student/:studentNum', (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum).then(data => {
        if (data) {
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // if no student found, set student to null
        }
    }).catch(() => {
        viewData.student = null; // if there was an error, set student to null
    }).then(collegeData.getCourses)
        .then(data => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"

            // render the "student" view
            res.render("student", { student: viewData.student, courses: viewData.courses });
        }).catch(() => {
            viewData.courses = []; // if there was an error, set courses to empty
            res.render("student", { student: viewData.student, courses: viewData.courses });
        });
});

app.post("/student/update", (req, res) => {
    console.log(req.body);
    collegeData.updateStudent(req.body).then(() => {
        res.redirect("/students");
    }).catch(err => {
        res.status(500).send("Unable to update student");
    });
});

// Route to handle form submission
app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch(err => {
        res.status(500).send('Unable to add student');
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize and start the server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("server listening on port: " + HTTP_PORT);
    });
}).catch(err => {
    console.log("Unable to start server: " + err);
});
