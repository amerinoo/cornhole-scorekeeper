import { describe, expect, it } from 'vitest';
import { validateCreateGameInput } from './validation';

describe('validateCreateGameInput', () => {
  it('accepts a valid 1v1 game', () => {
    expect(
      validateCreateGameInput({
        mode: '1v1',
        targetScore: 11,
        bluePlayerIds: ['blue-1'],
        redPlayerIds: ['red-1'],
      }),
    ).toEqual({
      isValid: true,
      errors: [],
    });
  });

  it('rejects wrong player counts in 2v2', () => {
    const result = validateCreateGameInput({
      mode: '2v2',
      targetScore: 21,
      bluePlayerIds: ['blue-1'],
      redPlayerIds: ['red-1', 'red-2'],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Equipo Azul debe tener 2 jugador(es) en 2v2.',
    );
  });

  it('rejects duplicate players across teams', () => {
    const result = validateCreateGameInput({
      mode: '1v1',
      targetScore: 11,
      bluePlayerIds: ['shared'],
      redPlayerIds: ['shared'],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Un mismo jugador no puede estar en ambos equipos.',
    );
  });
});
