require('express-async-errors');
const winston = require('winston'); //Logging package

module.exports = function(process){

    
    //winston.exceptions.handle(new winston.transports.File({ filename: 'UnhandledExceptions.log' }));
    winston.add(new winston.transports.File({ filename: './log/UnhandledExceptions.log' }));

    process.on('uncaughtException',(ex)=>{
        console.log('UnCaught exception: ' + ex);
        winston.error(ex.message,ex);
    });

    process.on('unhandledRejection',(ex)=>{
        console.log('UnHandled Rejection: ' + ex);
        winston.error(ex.message,ex);
    });
}