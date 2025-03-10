import * as authService from '../auth';

describe('Auth Service Integration Tests', () => {

  it('signIn and signOut should work correctly', async () => {
    // Sign in
    const { token, user } = await authService.signIn(process.env.TEST_USER_EMAIL, process.env.TEST_USER_PASSWORD);
    expect(token).toBeDefined();
    expect(user).toBeDefined();
    expect(user.email).toBe(process.env.TEST_USER_EMAIL);

    // Sign out
    await authService.signOut(token);
  });

  it('signUp, getSession and signout', async() => {
    const email = `testuser+${Date.now()}@example.com`;
    const password = 'test-password';

    // Sign up
    const newUser = await authService.signUp(email, password);
    expect(newUser).toBeDefined();
    expect(newUser.email).toBe(email);

    // Sign in to get token
    const {token, user:signInUser} = await authService.signIn(email, password)
    expect(token).toBeDefined()
    expect(signInUser.email).toBe(email)

    // Get Session
    const sessionUser = await authService.getSession(token)
    expect(sessionUser).toBeDefined()
    expect(sessionUser.email).toBe(email)

    // Sign out
    await authService.signOut(token)
  })

    it('getSession should throw error without token', async () => {
    // Get Session without token should throw
    await expect(authService.getSession(null)).rejects.toThrow(
      'Token is required'
    );
  });

      it('signOut should throw error without token', async () => {
    // Sign out without token should throw
     await expect(authService.signOut(null)).rejects.toThrow(
      'Token is required'
    );
  });
});
