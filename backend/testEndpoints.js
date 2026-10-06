async function testEndpoints() {
  const loginUrl = 'http://localhost:5000/api/auth/login';
  
  const roles = [
    { name: 'founder', url: 'http://localhost:5000/api/founder/dashboard' },
    { name: 'mentor', url: 'http://localhost:5000/api/mentor/dashboard' },
    { name: 'investor', url: 'http://localhost:5000/api/investor/dashboard' },
    { name: 'manager', url: 'http://localhost:5000/api/incubation/dashboard' },
    { name: 'admin', url: 'http://localhost:5000/api/admin/dashboard' }
  ];

  for (const role of roles) {
    console.log(`\nTesting ${role.name}...`);
    try {
      const email = `${role.name}0@example.com`;
      const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const loginData = await loginRes.json();
      
      if (!loginData.success) {
        console.error(`❌ Failed logging in ${role.name}: ${loginData.message}`);
        continue;
      }
      
      const token = loginData.data.accessToken;
      
      const dashRes = await fetch(role.url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      
      if (!dashData.success) {
        console.error(`❌ Failed testing ${role.name}: ${dashData.message}`);
      } else {
        console.log(`✅ GET ${role.url} SUCCESS`);
        console.log(`Response keys:`, Object.keys(dashData.data));
      }
    } catch (e) {
      console.error(`❌ Failed testing ${role.name}: ${e.message}`);
    }
  }
}

testEndpoints();
