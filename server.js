const express = require("express");
const app = express();
const mysql = require("promise-mysql");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load env vars
dotenv.config();

// Middleware
app.use(fileUpload({ createParentPath: true }));
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/webhook/stripe') {
        bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Connect to DB and load routes
mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}).then((db) => {
    console.log("✅ Connected to MySQL");

    setInterval(() => db.query('SELECT 1'), 10000);

    app.get('/', (req, res) => {
        res.json({ status: 200, msg: "Welcome to Roller Derby API" });
    });

    require('./routes')(app, db); // 👈 this loads index.js and mounts all routers

}).catch(err => console.error("DB connection error:", err));

// Start server
const PORT = process.env.PORT || 9500;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
