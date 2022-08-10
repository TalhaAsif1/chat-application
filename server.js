
var express = require('express')
var app = express()
var mongoose = require('mongoose')
var dotenv = require('dotenv')
var bodyParser = require('body-parser')
var http = require('http').Server(app)
var io = require('socket.io')(http)
const authRoute = require("./auth");


app.set('view-engine', 'ejs')

var Message = require('./userModel')

var {
    verifyToken,
 //   verifyTokenAndAuthorization,
} = require('./verifyToken')


dotenv.config()

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


app.use('/api', authRoute)

app.get('/messages',async(req, res) => {

    try {
        Message.find({}, (err, messages) => {
            res.send(messages)
        })
    } catch (err) {
        res.status(500).json(err)
    }
})

app.get('/messages/:user',async(req, res) => {

    try {

        var user = req.params.user
        Message.find({ name: user }, (err, messages) => {
            res.send(messages)
        })
    } catch (err) {
        res.status(500).json(err)
    }
})


app.post('/messages', verifyToken,async (req, res) => {
    try {
        var message = new Message(req.body);

        var savedMessage = await message.save()
        console.log('saved');

        var censored = await Message.findOne({ message: 'badword' });
        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body);

        console.log('message sent')
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('error', error);
    }
    finally {
        console.log('Message Posted')
    }

})

app.get('*', (req, res) => {
    res.status(404).json('page not found')
})


mongoose.connect(process.env.MONGO_URL).then(() =>
    console.log('Db connection successfull'))
    .catch((err) => {
        console.log('Can\'t\ connect to db')
        console.log(err)
    })



io.on('connection', () => {
    console.log('A user has connected')
})


var server = http.listen(3000, () => {
    console.log('server is running on port', server.address().port);
});