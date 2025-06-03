import { describe, it, expect, beforeEach } from 'vitest';
import { SupervisorManager, Supervisor } from './SupervisorManager';

describe('SupervisorManager', () => {
  let manager: SupervisorManager;
  const supervisorA: Supervisor = {
    id: 'a',
    name: 'Alice',
    expertiseTopics: ['machine learning', 'nlp'],
    rating: 4.8,
    currentLoad: 1,
    maxLoad: 2,
  };
  const supervisorB: Supervisor = {
    id: 'b',
    name: 'Bob',
    expertiseTopics: ['computer vision', 'robotics'],
    rating: 4.5,
    currentLoad: 2,
    maxLoad: 2,
  };
  const supervisorC: Supervisor = {
    id: 'c',
    name: 'Charlie',
    expertiseTopics: ['nlp', 'data mining'],
    rating: 4.9,
    currentLoad: 0,
    maxLoad: 1,
  };

  beforeEach(() => {
    manager = new SupervisorManager();
    manager.clearAll();
  });

  it('adds a supervisor', () => {
    manager.addSupervisor(supervisorA);
    expect(manager.findSupervisors('machine')).toHaveLength(1);
  });

  it('throws when adding a supervisor with duplicate id', () => {
    manager.addSupervisor(supervisorA);
    expect(() => manager.addSupervisor(supervisorA)).toThrow(/already exists/);
  });

  it('removes a supervisor by id', () => {
    manager.addSupervisor(supervisorA);
    manager.removeSupervisor('a');
    expect(manager.findSupervisors('machine')).toHaveLength(0);
  });

  it('throws when removing non-existent supervisor', () => {
    expect(() => manager.removeSupervisor('notfound')).toThrow(/not found/);
  });

  it('updates supervisor fields', () => {
    manager.addSupervisor(supervisorA);
    manager.updateSupervisor('a', { rating: 3.5, currentLoad: 2 });
    const [sp] = manager.findSupervisors('', { includeFull: true });
    console.log('findSupervisors result:', manager.findSupervisors('', { includeFull: true }));
    expect(sp.rating).toBe(3.5);
    expect(sp.currentLoad).toBe(2);
  });

  it('throws when updating non-existent supervisor', () => {
    expect(() => manager.updateSupervisor('notfound', { rating: 2 })).toThrow(/not found/);
  });

  describe('findSupervisors', () => {
    beforeEach(() => {
      manager.addSupervisor(supervisorA);
      manager.addSupervisor(supervisorB);
      manager.addSupervisor(supervisorC);
    });

    it('matches supervisors by expertise topic (case-insensitive, tokenized)', () => {
      const result = manager.findSupervisors('NLP');
      expect(result.map(s => s.id)).toContain('a');
      expect(result.map(s => s.id)).toContain('c');
    });

    it('excludes supervisors at maxLoad by default', () => {
      // Bob is at maxLoad
      const result = manager.findSupervisors('vision');
      expect(result.map(s => s.id)).not.toContain('b');
    });

    it('includes supervisors at maxLoad if includeFull is true', () => {
      const result = manager.findSupervisors('vision', { includeFull: true });
      expect(result.map(s => s.id)).toContain('b');
    });

    it('limits results by maxResults', () => {
      const result = manager.findSupervisors('nlp', { maxResults: 1 });
      expect(result).toHaveLength(1);
    });

    it('sorts by matchCount, rating, then name', () => {
      // Both Alice and Charlie match 'nlp', but Charlie has higher rating
      const result = manager.findSupervisors('nlp');
      expect(result[0].id).toBe('c');
      expect(result[1].id).toBe('a');
    });

    it('returns empty array if no matches', () => {
      const result = manager.findSupervisors('quantum');
      expect(result).toEqual([]);
    });
  });

  describe('tokenize', () => {
    it('splits text into lowercased tokens', () => {
      expect(SupervisorManager.tokenize('Machine Learning!')).toEqual(['machine', 'learning']);
      expect(SupervisorManager.tokenize('AI_NLP')).toEqual(['ai', 'nlp']);
    });
  });

  it('clearAll removes all supervisors', () => {
    manager.addSupervisor(supervisorA);
    manager.clearAll();
    expect(manager.findSupervisors('machine')).toHaveLength(0);
  });
});