async function testGoogle() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'curious.genius@gmail.com',
        googleId: 'google-oauth2-11235813',
        name: 'Genius Mind'
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Body:", data);
  } catch (err) {
    console.error("Test Error:", err);
  }
}

testGoogle();
