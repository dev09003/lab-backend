const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose'); // Import mongoose directly
const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

const Inventory = mongoose.model('Inventory', inventorySchema);





const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.json());

// MongoDB Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'inventory';

// Connect to the MongoDB server
MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    
    const db = client.db(dbName); // Access the database
    const inventoryCollection = db.collection('items'); // Access the collection

    // POST route to add item via barcode scan
    app.post('/addItem', (req, res) => {
        const barcodeData = req.body.barcodeData;

        // Parse the item details from the barcode data
        let newItem;
        try {
            newItem = JSON.parse(barcodeData);
        } catch (error) {
            return res.json({ success: false, message: 'Invalid barcode data' });
        }

        // Insert the item into the collection
        inventoryCollection.insertOne(newItem, (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to add item to inventory' });
            }
            res.json({ success: true });
        });
    });

    // Route to fetch inventory (already part of your code)
    app.get('/inventory', (req, res) => {
        inventoryCollection.find().toArray((err, items) => {
            if (err) return console.error(err);
            res.render('inventory', { items });
        });
    });

    // Start the server
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
  })
  .catch(error => {
    console.error('Failed to connect to the database:', error);
  });





// Define the connectToMongoDB function before using it
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

// Start the server
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));









