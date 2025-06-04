import { describe, it, expect, beforeEach } from 'vitest';
import { SupervisorManager, type Supervisor } from './SupervisorManager';

describe('SupervisorManager', () => {
  let mgr = new SupervisorManager();

  const s1: Supervisor = {
    id: '1',
    name: 'Paweł',
    expertiseTopics: ['machine learning', 'nlp'],
    rating: 4.5,
    currentLoad: 1,
    maxLoad: 2,
  };

  const s2: Supervisor = {
    id: '2',
    name: 'Marek',
    expertiseTopics: ['databases', 'big data'],
    rating: 4.8,
    currentLoad: 2,
    maxLoad: 2,
  };

  const s3: Supervisor = {
    id: '3',
    name: 'Piotr',
    expertiseTopics: ['machine learning', 'databases'],
    rating: 4.2,
    currentLoad: 3,
    maxLoad: 4,
  };

  beforeEach(() => {
    mgr.clearAll();
    mgr.addSupervisor(s1);
    mgr.addSupervisor(s2);
    mgr.addSupervisor(s3);
  });

  it('should add a supervisor', () => {
    const s4: Supervisor = {
      id: '4',
      name: 'Jacek',
      expertiseTopics: ['big data'],
      rating: 5,
      currentLoad: 4,
      maxLoad: 6,
    };

    mgr.addSupervisor(s4);
    expect(mgr.findSupervisors('Jacek')).toContainEqual(s4);
  });

  it('should throw an error when adding a supervisor with existing id', () => {
    expect(() => mgr.addSupervisor(s1)).toThrowError(`Supervisor with id ${s1.id} already exists`);
  });

  it('should remove a supervisor', () => {
    mgr.removeSupervisor(s1.id);
    expect(mgr.findSupervisors(s1.name)).not.toContain(s1);
  });

  it('should throw an error when removing a supervisor who doesn\'t exist', () => {
    expect(() => mgr.removeSupervisor('0')).toThrowError('Supervisor with id 0 not found');
  });

  it('should update a supervisor', () => {
    const updates = { rating: 4.5, currentLoad: 2 };
    mgr.updateSupervisor(s3.id, updates);

    const updated = mgr.findSupervisors(`${s3.id} ${s3.name} ${s3.expertiseTopics.join(' ')}`)[0];

    expect(updated.rating).toBe(updates.rating);
    expect(updated.currentLoad).toBe(updates.currentLoad);
  });
});

describe('SupervisorManager.tokenize', () => {
  it('should split text into lowercase words', () => {
    expect(SupervisorManager.tokenize('Machine Learning NLP')).toEqual(['machine', 'learning', 'nlp']);
  });

  it('should handle empty string', () => {
    expect(SupervisorManager.tokenize('')).toEqual([]);
  });

  it('should ignore special characters', () => {
    expect(SupervisorManager.tokenize('./ai_,-ml!')).toEqual(['ai', 'ml']);
  });
});