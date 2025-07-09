import { it } from 'vitest';
import { describe, expect } from 'vitest';

describe('Entry point', () => {
  it('should run without errors', async () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    await import('@/main');

    expect(document.getElementById('root')).toBeTruthy();
    document.body.innerHTML = '';
  });
});
