const axios = require('axios')

async function testAPI() {
  try {
    // First, try to login to get a token
    console.log('Attempting login...')
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'def@learnsphere.com',
      password: 'def123'
    })
    
    console.log('Login successful!')
    console.log('Token:', loginRes.data.token)
    console.log('User:', loginRes.data.user)
    
    const token = loginRes.data.token
    
    // Test enrollments endpoint
    console.log('\nTesting /api/enrollments/my...')
    const enrollmentsRes = await axios.get('http://localhost:5000/api/enrollments/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Enrollments response:', JSON.stringify(enrollmentsRes.data, null, 2))
    
    // Test progress endpoint
    console.log('\nTesting /api/progress/my...')
    const progressRes = await axios.get('http://localhost:5000/api/progress/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('Progress response:', JSON.stringify(progressRes.data, null, 2))
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

testAPI()
