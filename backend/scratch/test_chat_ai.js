async function testChat() {
  try {
    const res = await fetch('http://localhost:5000/api/sheldon/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: [],
        message: 'Hello Dr. Logic, verify the formula for gravitational velocity.'
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Body:", data);
  } catch (err) {
    console.error("Test Error:", err);
  }
}

testChat();
