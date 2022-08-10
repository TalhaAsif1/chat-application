const router = require("express").Router();
const User = require("./userModel");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");


var {
    verifyToken,
  //  verifyTokenAndAuthorization,
} = require('./verifyToken')



router.get('/user/register',(req, res) => {
    res.render('register.ejs')
})




//REGISTER
router.post("/user/register",async (req, res) => {
 
    const newUser = new User({
        name: req.body.name,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString(),
    });
   
    try {
        const savedUser = await newUser.save();
        res.status(201).redirect('/api/user/login');
        
        
    } catch (err) {
        res.status(500).redirect('/api/user/register');
    }
});

//LOGIN

router.get('/user/login', (req, res) => {
    res.render('login.ejs')
})


router.post('/user/login', async (req, res) => {
 
    try {
        const user = await User.findOne(
            {
                name: req.body.name
            }
        );

        !user && res.status(401).json("Wrong User Name");

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );


        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        const inputPassword = req.body.password;

        originalPassword != inputPassword &&
            res.status(401).json("Wrong Password");
         

        const accessToken = jwt.sign(
            {
                id: user._id,

            },
            process.env.JWT_SEC,
            { expiresIn: "3d" }
        );

        const { password,...others} = user._doc;
        res.status(200).redirect('/');
           
    } catch (err) {
        res.status(500).json(err);
            res.redirect('/api/user/login')
    }

});

module.exports = router;