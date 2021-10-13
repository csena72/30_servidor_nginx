exports.loginRender = (req,resp) => {    
    const user = {};
    resp.render('login', {user: user});
};