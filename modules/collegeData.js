const fs = require("fs");
const path = require("path");

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses");
                return;
            }

            fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students");
                    return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(dataCollection.students);
    });
}

module.exports.getTAs = function () {
    return new Promise((resolve, reject) => {
        const filteredStudents = dataCollection.students.filter(student => student.TA);

        if (filteredStudents.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(filteredStudents);
    });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(dataCollection.courses);
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        const foundStudent = dataCollection.students.find(student => student.studentNum == num);

        if (!foundStudent) {
            reject("query returned 0 results");
            return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
        const filteredStudents = dataCollection.students.filter(student => student.course == course);

        if (filteredStudents.length == 0) {
            reject("query returned 0 results");
            return;
        }

        resolve(filteredStudents);
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA !== undefined;
        studentData.studentNum = dataCollection.students.length + 1;
        dataCollection.students.push(studentData);

        fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 2), 'utf8', (err) => {
            if (err) {
                reject("Unable to write student data");
                return;
            }
            resolve();
        });
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        const foundCourse = dataCollection.courses.find(course => course.courseId == id);

        if (!foundCourse) {
            reject("query returned 0 results");
            return;
        }

        resolve(foundCourse);
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        // Find the student by studentNum
        let index = dataCollection.students.findIndex(student => student.studentNum == studentData.studentNum);
        if (index === -1) {
            reject("Student not found");
        } else {
            // Update the student data
            dataCollection.students[index] = {
                studentNum: studentData.studentNum,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                email: studentData.email,
                addressStreet: studentData.addressStreet,
                addressCity: studentData.addressCity,
                addressProvince: studentData.addressProvince,
                TA: (studentData.TA === 'on'),
                status: studentData.status,
                course: studentData.course
            };

            // Write the updated data back to the JSON file
            fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students, null, 2), 'utf8', (err) => {
                if (err) {
                    reject("Unable to write student data");
                } else {
                    resolve();
                }
            });
        }
    });
};
