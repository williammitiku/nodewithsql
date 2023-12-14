// Install required packages: express, mongodb, cors
const express = require('express');
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
 // Replace with the correct path

const app = express();
const port = 4003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URL and Database Name
const url = 'mongodb+srv://proper1:euDDiTFwPsPf3Qi1@cluster0.1ib4n1x.mongodb.net/';
const dbName = 'elilta';


async function sendSMS(text, amountOfTheProduct) {
  const apiUrl = 'https://hahu.io/api/send/sms';
  const secret = 'a2b00195f2ab7d718936b005b5240da73f1cbc3b'; // Replace with your actual API secret key

  const params = {
    secret: secret,
    mode: 'devices',
    phone: '+251921951592', // Replace with the phone number you want to send the SMS to
    message: `${text}}`,
    device: '00000000-0000-0000-aee4-1ad38bf6221e', // Replace with your device identifier
    sim: 1, // Replace with your SIM identifier
    priority: 1
  };

  try {
    const response = await axios.get(apiUrl, { params });
    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

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

app.get('/productTotalQuantities', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);

    const productQuantities = await db.collection('sales2').aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productName',
          totalQuantity: { $sum: '$products.quantity' }
        }
      }
    ]).toArray();

    const productNames = productQuantities.map((item) => item._id);
    const totalQuantities = productQuantities.map((item) => item.totalQuantity);

    const response = {
      ProductName: productNames,
      TotalQuantityOrdered: totalQuantities
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

app.get('/monthlySales', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);

    // Construct an array to hold total sales amounts for each month
    const totalSales = [];

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Loop through each month (from January to December)
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      // Query MongoDB for sales data for the current month
      const sales = await db.collection('sales2').find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }).toArray();

      // Calculate total amount for the month
      const totalAmount = sales.reduce((acc, sale) => acc + sale.amountOfTheProduct, 0);

      // Push the total sales amount into the array
      totalSales.push(totalAmount || 0); // If no sales, set total amount to 0
    }

    // Return the array of total sales amounts as JSON
    res.json(totalSales);
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

// ... (Your existing code remains the same)

// New endpoint to fetch product summary from sales2 document
app.get('/productSummaryQ', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);

    const productSummary = await db.collection('sales2').aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productName',
          totalQuantity: { $sum: '$products.quantity' },
          totalAmount: { $sum: '$products.totalPrice' }
        }
      },
      {
        $project: {
          _id: 0,
          productName: '$_id',
          totalQuantity: 1,
          totalAmount: 1
        }
      }
    ]).toArray();

    res.json(productSummary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.close();
  }
});

// ... (Your existing code remains the same)


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

    // Send SMS after successfully inserting the sale data
    const textToSend = `Dear Customer, You have bought Products: ${products.map(p => p.productName).join(', ')} -  Which the total Amount is : ${amountOfTheProduct} - Thank You :  ${nameOfTheShop} -`;
    await sendSMS(textToSend); // Using the sendSMS function

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
