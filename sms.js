const axios = require('axios');

async function sendSMS(text, amountOfTheProduct) {
  const apiUrl = 'https://hahu.io/api/send/sms';
  const secret = 'YOUR_API_SECRET_KEY'; // Replace with your actual API secret key

  const params = {
    secret: secret,
    mode: 'devices',
    phone: '+251921951592', // Replace with the phone number you want to send the SMS to
    message: `Text: ${text}, Amount: ${amountOfTheProduct}`,
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

module.exports = sendSMS; // Export the function to use it in other files if needed
