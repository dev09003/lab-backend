const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose'); 
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const profileRoute = require("./routes/profile");

const multer = require('multer');

// Create an instance of Express
const app = express();
const PORT = 8001;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save to the uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
    },
});

const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Define the connectToMongoDB function within this file
const connectToMongoDB = async (url) => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit process with failure
    }
};

// Connect to MongoDB
connectToMongoDB(process.env.MONGODB ?? "mongodb://localhost:27017/short-url");

// Set the view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Route handling
app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);
app.use("/profile", restrictToLoggedinUserOnly, profileRoute);

// URL redirection
app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );
    if (entry) {
        res.redirect(entry.redirectURL);
    } else {
        res.status(404).send('URL not found'); // Handle case where entry is not found
    }
});

// Define routes
app.get('/', (req, res) => {
    res.render('index');  // Main homepage (if you have index.ejs)
});

app.get('/inventory', (req, res) => {
    res.render('inventory');  // Renders inventory.ejs from the views folder
});

app.get('/labtour', (req, res) => {
    res.render('labtour');  // Renders inventory.ejs from the views folder
});

app.get('/labnotes', (req, res) => {
    res.render('labnotes');  // Renders inventory.ejs from the views folder
});

// Start the server
app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));




