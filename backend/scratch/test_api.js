async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `test_${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test User'
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Body:", data);
  } catch (err) {
    console.error("Test Error:", err);
  }
}

test();
