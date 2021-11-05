const UserModel = require('../models/user.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/******************************************************************************
 *                              User Controller
 ******************************************************************************/
class UserController {
    getAllUsers = async (req, res, next) => {
        let userList = await UserModel.find();
        if (!userList.length) {
            throw new HttpException(404, 'Users not found');
        }

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.send(userList);
    };

    getUserById = async (req, res, next) => {
        const user = await UserModel.findOne({ id: req.params.id });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getUserByuserName = async (req, res, next) => {
        const user = await UserModel.findOne({ username: req.params.username });
        if (!user) {
            throw new HttpException(404, 'User not found');
        }

        const { password, ...userWithoutPassword } = user;

        res.send(userWithoutPassword);
    };

    getCurrentUser = async (req, res, next) => {
        const { password, ...userWithoutPassword } = req.currentUser;

        res.send(userWithoutPassword);
    };

    // app.post(‘/update/:id’, (req, res) => {
    //     Person.updateOne(
    //     { _id: req.params.id }, 
    //     { $set: { name: req.body.name, age: req.body.age } }, 
    //     (err, person) => {
    //       if(err) return res.json(err);
    //       res.redirect(‘/’);
    //     });
    //   });

    createUser = async (req, res, next) => {
        this.checkValidation(req);
        
        await this.hashPassword(req);
        await this.get_regip(req);
        
        // let user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        // console.log('/home/dev/www/easypay/app/controllers/user.controller.js\n');
        // console.log(' req.body.email : ' + req.body.email +'\n');
        // console.log(' req.body.regip : ' + req.body.regip +'\n');
        console.log(JSON.stringify(req.body));
        // if (req.body.regip) { req.body.regip === user_ip; }
        // console.log(' req.body.regip : ' + req.body.regip +'\n');
        // const str_cr_user = {
        //     regip: user_ip,
        //     username: req.body.username,
        //     email: req.body.email,
        //     password: req.body.password,
        //     confirm_password: req.body.confirm_password,
        // };
        // res.send(str_cr_user);

        const result = await UserModel.create(req.body);
        if (!result) {
            throw new HttpException(500, 'Something went wrong');
        }

        // res.status(201).send('User was created!');
        res.writeHead("200", { "Content-Type": "text/html;charset=utf-8" });
        res.end("<script>alert('User was created! please log in');document.location.href='/';</script>");
    };

    updateUser = async (req, res, next) => {
        this.checkValidation(req);

        await this.hashPassword(req);
        // await this.get_last_ip(req);
        if (req.body.last_ip) {
            req.body.last_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        }
        const { confirm_password, ...restOfUpdates } = req.body;

        // do the update query and get the result
        // it can be partial edit
        const result = await UserModel.update(restOfUpdates, req.params.id);

        if (!result) {
            throw new HttpException(404, 'Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        const message = !affectedRows ? 'User not found' :
            affectedRows && changedRows ? 'User updated successfully' : 'Updated faild';

        res.send({ message, info });
    };

    deleteUser = async (req, res, next) => {
        const result = await UserModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, 'User not found');
        }
        res.send('User has been deleted');
    };

    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        const { email, password: pass } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new HttpException(401, 'Unable to login!');
        }
        // var bcrypt = require('bcrypt');
        // user_dbpwd = user_dbpwd.replace(/^\$2y(.+)$/i, '$2a$1');
        // if(bcrypt.compareSync(param_password, user_dbpwd)){

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new HttpException(401, 'Incorrect password!');
        }

        // user matched!
        const secretKey = process.env.SECRET_JWT || "";
        const token = jwt.sign({ user_id: user.id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        const { password, ...userWithoutPassword } = user;
        

        var user_idx  = user.id;
        var user_email  = user.email;
        // var user_ip   = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        
        res.cookie('user_idx', user_idx); // 2020-01-27
        res.cookie('user_email', user_email); // 2020-01-27
        res.redirect('/');

        // res.send({ ...userWithoutPassword, token });
    };

    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new HttpException(400, 'Validation faild', errors);
        }
    }

    // hash password if it exists
    hashPassword = async (req) => {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 8);
        }
    }

    // get_last_ip = async (req) => {
    //     if (req.body.last_ip) {
    //         req.body.last_ip = await req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    //     }
    // }
    get_regip = (req) => {
        var user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if (user_ip ==""){ user_ip = "unknown"; }
        if (req.body.regip) {
            req.body.regip = user_ip;
        }
    }

}



/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new UserController;