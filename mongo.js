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
app.get('/sales2/products-summary', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = await db.collection('sales2').aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productName',
          quantity: { $sum: '$products.quantity' },
          totalPrice: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          productName: '$_id',
          quantity: 1,
          totalPrice: 1
        }
      }
    ]).toArray();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

app.get('/salesNew', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = await db.collection('sales2').find().toArray();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});


app.get('/salesNewDate', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().slice(0, 10);

    // Query MongoDB for sales data for the current date
    const sales = await db.collection('sales2').find({
      createdAt: {
        $gte: new Date(currentDate),
        $lt: new Date(currentDate + 'T23:59:59') // Consider the whole day until 23:59:59
      }
    }).toArray();

    // Calculate total amount for the day
    const totalAmount = sales.reduce((acc, sale) => acc + sale.amountOfTheProduct, 0);

    // Function to convert number to abbreviated form
    const formatNumber = (num) => {
      const suffixes = ['', 'K', 'M', 'B', 'T']; // Add more suffixes as needed
      const tier = Math.log10(num) / 3 | 0;
      if (tier === 0) return num;
      const suffix = suffixes[tier];
      const scale = Math.pow(10, tier * 3);
      const scaled = num / scale;
      return scaled.toFixed(1) + suffix;
    };

    // Convert totalAmount to abbreviated form
    const formattedTotalAmount = formatNumber(totalAmount);

    // Log total amount to console
    console.log('Total Amount for', currentDate, ':', formattedTotalAmount);

    // Include total amount in the response (in abbreviated form)
    const response = {
      totalAmount: formattedTotalAmount,
      salesData: sales
    };

    // Return response as JSON
    res.json(response);
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
    const {
      nameOfTheShop,
      phoneNumber,
      latitude,
      longitude,
      nameOfSales,
      products,
      amountOfTheProduct
    } = req.body;

    await client.connect();
    const dbName = 'elilta'; // Your database name
    const db = client.db(dbName);
    
    // Check if data already exists with phoneNumber and products
    const existingSale = await db.collection('sales2').findOne({
      'phoneNumber': phoneNumber,
      $and: products.map(p => ({
        'products': {
          $elemMatch: {
            'productName': p.productName,
            'quantity': p.quantity
          }
        }
      }))
    });

    if (existingSale) {
      return res.status(400).json({ message: 'Sale with this phone number and products already exists' });
    }

    const createdAt = new Date(); // Get the current timestamp

    const newSale = {
      nameOfTheShop,
      phoneNumber,
      latitude,
      longitude,
      nameOfSales,
      products,
      amountOfTheProduct,
      createdAt
    };

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
