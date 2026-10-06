async function test() {
  try {
    const email = `test${Date.now()}@example.com`;
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email,
        password: 'password123',
        role: 'FOUNDER'
      })
    });
    const data = await res.json();
    console.log('Registration Response:', data);

    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
