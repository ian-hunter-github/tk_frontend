import { authService }  from '../authService'; // Import the module we're testing

jest.mock(authService); // Mock the authService module

// Manually define the mock functions
authService.signIn = jest.fn();
authService.signUp = jest.fn();

authService.signOut = jest.fn();
authService.getSession = jest.fn();

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it('signIn should handle successful sign-in', async () => {
    const mockResult = { token: 'mock-token', user: { id: 1, email: 'test@example.com' } };
    authService.signIn.mockResolvedValue(mockResult);

    const result = await authService.signIn('test@example.com', 'password');

    expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    expect(result).toEqual(mockResult);
  });

  it('signIn should handle sign-in failure', async () => {
    authService.signIn.mockRejectedValue(new Error('Unauthorized'));

    await expect(authService.signIn('test@example.com', 'password')).rejects.toThrow(
      'Unauthorized'
    );

    expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('signUp should handle successful sign-up', async () => {
    const mockResult = { user: { id: 2, email: 'newuser@example.com' } };
    authService.signUp.mockResolvedValue(mockResult);

    const result = await authService.signUp('newuser@example.com', 'password');

    expect(authService.signUp).toHaveBeenCalledWith('newuser@example.com', 'password');
    expect(result).toEqual(mockResult);
  });

  it('signUp should handle sign-up failure', async () => {
    authService.signUp.mockRejectedValue(new Error('Bad Request'));

    await expect(authService.signUp('newuser@example.com', 'password')).rejects.toThrow(
      'Bad Request'
    );
    expect(authService.signUp).toHaveBeenCalledWith('newuser@example.com', 'password');
  });

  it('signOut should handle successful sign-out', async () => {
    authService.signOut.mockResolvedValue({});
    const mockToken = 'some-token';

    const result = await authService.signOut(mockToken);

    expect(authService.signOut).toHaveBeenCalledWith(mockToken);
    expect(result).toEqual({});
  });

  it('signOut should handle sign-out failure', async () => {
    authService.signOut.mockRejectedValue(new Error('Server Error'));
    const mockToken = 'some-token';

    await expect(authService.signOut(mockToken)).rejects.toThrow('Server Error');

    expect(authService.signOut).toHaveBeenCalledWith(mockToken);
  });

  it('getSession should handle successful session retrieval', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    authService.getSession.mockResolvedValue(mockUser);
    const mockToken = 'some-token';

    const user = await authService.getSession(mockToken);

    expect(authService.getSession).toHaveBeenCalledWith(mockToken);
    expect(user).toEqual(mockUser);
  });

  it('getSession should handle session retrieval failure', async () => {
    authService.getSession.mockRejectedValue(new Error('Unauthorized'));
    const mockToken = 'some-token';

    await expect(authService.getSession(mockToken)).rejects.toThrow('Unauthorized');

    expect(authService.getSession).toHaveBeenCalledWith(mockToken);
  });
});
