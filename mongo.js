// Install required packages: express, mongodb, cors
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URL and Database Name
const url = 'mongodb+srv://proper1:euDDiTFwPsPf3Qi1@cluster0.1ib4n1x.mongodb.net/';
const dbName = 'elilta';

// Endpoint to fetch sales data
app.get('/sales', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = await db.collection('sales').find().toArray();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

app.get('/products', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});
// Express route to fetch sales names from MongoDB
app.get('/salesReps', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = await db.collection('salesReps').find().toArray();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

// Endpoint to add a new sale
app.post('/sales', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const { nameOfTheShop, phoneNumber, amountOfProducts, nameOfSales, carPlateNumber, latitude, longitude } = req.body;
    const newSale = {
      nameOfTheShop,
      phoneNumber,
      amountOfProducts,
      nameOfSales,
      carPlateNumber,
      latitude,
      longitude,
    };
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection('sales').insertOne(newSale);
    res.json({ message: 'Sale added successfully', data: result.ops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

app.post('/sales', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const { nameOfTheShop, phoneNumber, productName, quantity, amountOfTheProduct, nameOfSales, latitude, longitude } = req.body;
    const newSale = {
      nameOfTheShop,
      phoneNumber,
      productName,
      quantity,
      amountOfTheProduct,
      nameOfSales,
      latitude,
      longitude,
    };
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection('sales').insertOne(newSale);
    res.json({ message: 'Sale added successfully', data: result.ops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

app.post('/salesUpdated', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const { nameOfTheShop, phoneNumber, productName, quantity, amountOfTheProduct, nameOfSales, latitude, longitude } = req.body;
    const newSale = {
      nameOfTheShop,
      phoneNumber,
      productName,
      quantity,
      amountOfTheProduct,
      nameOfSales,
      latitude,
      longitude,
    };
    await client.connect();
    const db = client.db(dbName);
    const result = await db.collection('sales2').insertOne(newSale);
    res.json({ message: 'Sale added successfully', data: result.ops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
