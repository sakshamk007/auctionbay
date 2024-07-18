module.exports = function(err,req,res,next){
    console.error(err);
    res.status(500).json({
        message: 'Something Went Wrong',
        error: err.message
    });
}