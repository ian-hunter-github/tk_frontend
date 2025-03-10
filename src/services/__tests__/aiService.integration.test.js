// aiService.integration.test.js
import { getAiSuggestions } from '../ai.js';
import { getSessionToken } from '../../utils/getSessionToken';

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

describe('AI Service Integration Tests', () => {
    let token;

    beforeAll(async () => {
        token = await getSessionToken(ADMIN_EMAIL, ADMIN_PASSWORD);
    }, 20000);

  it('should get AI suggestions', async () => {
    const prompt = 'Suggest criteria for evaluating cars';
    const suggestions = await getAiSuggestions(prompt, token);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0)
    suggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
    })

  }, 60000);
});
