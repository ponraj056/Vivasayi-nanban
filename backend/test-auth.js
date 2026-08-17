const axios = require('axios');

async function testAuth() {
  try {
    console.log("1. Testing Registration for Farmer...");
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Test Farmer",
      phone: "9876543210",
      email: "farmer@test.com",
      password: "password123",
      role: "farmer",
      village: "Test Village",
      district: "Coimbatore"
    });
    console.log("Registration Response:", regRes.data);

    console.log("2. Testing Login...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      phone: "9876543210",
      password: "password123"
    });
    console.log("Login Response:", loginRes.data);
    const token = loginRes.data.token;

    console.log("3. Testing /me...");
    const meRes = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Me Response:", meRes.data.user.name, meRes.data.user.role);
    
    console.log("4. Testing Admin Auth (Should Fail)...");
    try {
      await axios.get('http://localhost:5000/api/auth/admin-only', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.log("Admin Only Response (Expected Error):", e.response.data);
    }

  } catch (error) {
    console.error("Test failed:", error.response ? error.response.data : error.message);
  }
}

testAuth();
