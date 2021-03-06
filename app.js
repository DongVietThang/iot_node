const passport = require('passport');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const config = require('./config');

const app = express();
const { applyPassportStrategy } = require('./middleware/authenticate');
const router = require('./routes/index');
const mqttClient = require('./mqtt');
const { receiveData } = require('./mqtt/subcribe');

mongoose.connect(config.db.url, config.db.options);
mongoose.connection.on('error', console.log);
mongoose.Promise = global.Promise;

mqttClient.connectMQTT();
mqttClient.onSubcribe('/data', receiveData);

// configure app to use library
applyPassportStrategy(passport);
app.use(cors());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router(app);

// START THE SERVER
// =============================================================================
app.listen(config.port);
