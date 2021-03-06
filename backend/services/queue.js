const client = require('./database').client;
const long = require('long');
const {retrieve_zoom_auth} = require('./auth');
const nodemailer = require('nodemailer');
const request = require('request');
function make_password(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
async function createMeeting(lmao,start_time,doctor_email,email){
    start_time = parseInt(start_time)*1000;
    const token = await retrieve_zoom_auth(doctor_email);
    const pwd=make_password(6);
    var date = new Date(start_time);
    let iso = date.toISOString().split('.')[0]+"Z";
    const meetOptions = {
        method:"POST",
        url:"https://api.zoom.us/v2/users/me/meetings",
        headers: {
            Authorization: "Bearer "+token,
            "Content-Type":"application/json"
        },
        json:{
        topic: "appointment",
            start_time: iso,
            duration: 30,
            timezone: "UTC",
            password: pwd,
            agenda: "Checkup",
            settings: {
            host_video: true,
                participant_video: true,
                join_before_host: true,
                mute_upon_entry: true,
                enforce_login: false,
                registrants_email_notification: true
        }
    }

    };
    request(meetOptions,function(error,response,body){
        let data = body;
        console.log(body);

        // data.start_url
        client.query(
            'INSERT INTO queue (start, finish, timed, color, doctor_email, details, name, start_url, join_url,password,email) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [Math.floor(parseInt(lmao.start)),Math.floor(parseInt(lmao.finish)),lmao.timed,lmao.color,lmao.doctor_email,lmao.details,lmao.name,data.start_url,data.join_url,pwd,email]
        )
        .then()
        .catch(e => console.log(e));
        send_email(email,data.join_url,data.start)


    });
}
function send_email(email,join_url,start){
    let transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: 'af1053a81e73b9',
            pass: '275fdf28508932'
        }
    });
    const message = {
        from: 'teleclinic@mail.ca', // Sender address
        to: email,         // List of recipients
        subject: 'Zoom appointment', // Subject line
        text: 'you are receiving this email because you have an appointment at'+start+". The join link is "+join_url+" and will be available at the time of the appointment" // Plain text body
    };
    transport.sendMail(message, function(err, info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info,"nithins mail");
        }
    });
}



const isDoctor = (email) => client.query(
    'SELECT EXISTS(SELECT 1 from doctors where email = $1)',
    [email]
)
    .then(res => res.rows[0].exists)
    .catch(e => e);

const getDoctor = (email) => client.query(
    'SELECT a.queue_id, a.start, a.finish, a.timed, a.color, a.doctor_email, a.details, a.name, a.start_url, a.join_url, a.password, a.email, u.first_name, u.last_name FROM queue a JOIN users u ON a.email = u.email WHERE a.doctor_email = $1 ORDER BY a.start,a.finish',
    [email]
)
    .then(res => res.rows)
    .catch(e => e);

const getPatient = (email) => client.query(
    'SELECT s.* FROM (SELECT t.* ROW_NUMBER() OVER(ORDER BY t.start) AS position FROM TABLE queue) s WHERE s.email = $1',
    [email]
)
    .then(res => res.rows[0])
    .catch(e => e);

const deleteAppointment = (appointment_id) => client.query(
    'DELETE FROM queue WHERE queue_id = $1',
    [appointment_id]
)
    .then()
    .catch(e => e);

const getTimes = () => client.query(
    'SELECT start FROM queue ORDER BY start',
    []
)
    .then(res => res.rows)
    .catch(e => e);


module.exports = {
    createMeeting:createMeeting,
    isDoctor:isDoctor,
    getDoctor:getDoctor,
    getPatient:getPatient,
    deleteAppointment:deleteAppointment,
    getTimes:getTimes
}
