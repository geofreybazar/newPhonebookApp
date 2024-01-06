export default function errorHandler(error, req, res, next) {
    console.error(error.message);
    console.log(error.name);

    if (error.name ==='CastError'){
        return res.status(400).json({message: "Malformated ID"});
    } else if (error.name === 'ValidationError'){
        return res.status(400).json({error: error.message});
    } else if (error.name === 'JsonWebTokenError'){
        return res.status(401).json({error: error.message});
    } else if (error.name === 'TokenExpiredError'){
        return res.status(401).json({ error: "token expired"});
    }

    next(error);
}