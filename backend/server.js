const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { body, validationResult } = require("express-validator");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
let db;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/reas-db";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Validation middleware
const validateLead = [
  body("estateType")
    .notEmpty()
    .withMessage("Estate type is required")
    .isIn(["byt", "dům", "pozemek"])
    .withMessage("Estate type must be one of: byt, dům, pozemek"),

  body("fullname")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(\+420)?[ ]?[0-9]{3}[ ]?[0-9]{3}[ ]?[0-9]{3}$/)
    .withMessage("Please enter a valid Czech phone number"),

  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("region").notEmpty().withMessage("Region is required"),

  body("district").notEmpty().withMessage("District is required"),
];

// API endpoint for saving leads
app.post("/lead", validateLead, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { estateType, fullname, phone, email, region, district } = req.body;

    const lead = {
      estateType,
      fullname,
      phone,
      email,
      region,
      district,
    };

    const result = await db.collection("leads").insertOne(lead);

    res.status(201).json({
      success: true,
      message: "Lead saved successfully",
      leadId: result.insertedId,
      lead: {
        id: result.insertedId,
        ...lead,
      },
    });
  } catch (error) {
    console.error("Error saving lead:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Start server
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(console.error);
