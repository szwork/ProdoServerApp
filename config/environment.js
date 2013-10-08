

module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return {dev setting};

        case 'production':
            return {prod settings};

        default:
            return {error or other settings};
    }
};

