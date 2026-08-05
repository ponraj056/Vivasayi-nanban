const axios = require('axios');

async function testRegistration() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123',
      role: 'farmer',
      farmerProfile: {
        location: 'Test Village',
        district: 'Test District',
        landSize: '5',
        crops: 'rice, wheat'
      }
    });
    console.log('Registration Success:', res.data);
  } catch (err) {
    console.error('Registration Error:', err.response ? err.response.data : err.message);
  }
}

testRegistration();
