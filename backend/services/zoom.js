const {CLIENT_ID} = require("../../config");
const {CLIENT_SECRET} = require("../../config");
const client = require('./database').client;
function assignCode(code,email) {
    var authOptions = {
        method: 'POST',
        url: 'https://zoom.us/oauth/token',
        qs: {
            grant_type: 'authorization_code',
            //The code below is a sample authorization code. Replace it with your actual authorization code while making requests.
            code: code,
            //The uri below is a sample redirect_uri. Replace it with your actual redirect_uri while making requests.
            redirect_uri: 'http://134.209.168.108:3000/zoom/create/'
        },
        headers: {
            /**The credential below is a sample base64 encoded credential. Replace it with "Authorization: 'Basic ' + Buffer.from(your_app_client_id + ':' + your_app_client_secret).toString('base64')"
             **/
            Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        }

    };
    request(authOptions,function(error,response,body){

        let token = JSON.parse(body).access_token;
        // add query that takes token and assigns it to the email.
        //client.query()

    });
}
function retrieve_auth(){

}

module.exports = {
    assignCode: assignCode
}
