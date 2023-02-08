var express = require('express');
const index = require('./routers/index')

const app = express();
var port = 3030;

app.set('views', './views')
app.set('view engine', 'pug')

app.use(express.urlencoded({ extended: false}))
app.use(express.static('public'));
app.use(express.static('models'));

app.use('/',index);

app.listen(port, function () {
  console.log('Example app listening on :' + port + '!');
});

