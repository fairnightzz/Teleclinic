import {KEY} from '../config.js';
import { client } from './database.service';

const jwt = require('jsonwebtoken');

export const register = (email, first_name,last_name, password, phone_number, health_card_number) => client.query(
    'INSERT INTO users(email, first_name, last_name, password, phone_number, health_card_number) VALUES ($1,$2,$3,$4,$5, $6) RETURNING email',
    [email,first_name,last_name,password,phone_number,health_card_number]
)
    .then(res => generateToken(res.rows[0].email))
    .catch(e => e);

export const login = (email,password) => client.query(
    'SELECT * FROM users where email = $1 AND password = $2',
    [email,password]
)
    .then(res => generateToken(res.rows[0].username))
    .catch(e => e);

export const generateToken = (email) => jwt.sign(
    { email: email},
    KEY,
    {expiresIn: "24h"}
);