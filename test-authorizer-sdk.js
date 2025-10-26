const { Authorizer } = require('@authorizerdev/authorizer-js');

const authorizer = new Authorizer({
  authorizerURL: 'https://auth.claimready.io',
  redirectURL: 'http://localhost:3000',
  clientID: '9c81da5e-0635-43c5-bcef-c629174c7c6f',
});

async function testSignup() {
  try {
    console.log('Testing Authorizer SDK signup...');
    const result = await authorizer.signup({
      email: 'testuser12@example.com',
      password: 'password123',
      confirm_password: 'password123',
      given_name: 'Test',
      family_name: 'User',
    });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testSignup();
