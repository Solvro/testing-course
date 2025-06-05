import { describe, it, expect, beforeEach } from 'vitest';
import { SupervisorManager, Supervisor } from './SupervisorManager';

describe('SupervisorManager', () => {
  let manager: SupervisorManager;
  const mockSupervisor: Supervisor = {
    id: '1',
    name: 'Jan Kowalski',
    expertiseTopics: ['machine learning', 'nlp'],
    rating: 4.5,
    currentLoad: 2,
    maxLoad: 5
  };

  beforeEach(() => {
    manager = new SupervisorManager();
  });

  describe('addSupervisor', () => {
    it('should add a new supervisor successfully', () => {
      manager.addSupervisor(mockSupervisor);
      const result = manager.findSupervisors('machine learning');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockSupervisor);
    });

    it('should throw error when adding supervisor with existing id', () => {
      manager.addSupervisor(mockSupervisor);
      expect(() => manager.addSupervisor(mockSupervisor)).toThrow(`Supervisor with id ${mockSupervisor.id} already exists`);
    });
  });

  describe('removeSupervisor', () => {
    it('should remove supervisor successfully', () => {
      manager.addSupervisor(mockSupervisor);
      manager.removeSupervisor(mockSupervisor.id);
      const result = manager.findSupervisors('machine learning');
      expect(result).toHaveLength(0);
    });

    it('should throw error when removing non-existent supervisor', () => {
      expect(() => manager.removeSupervisor('non-existent')).toThrow('Supervisor with id non-existent not found');
    });
  });

  describe('updateSupervisor', () => {
    it('should update supervisor successfully', () => {
      manager.addSupervisor(mockSupervisor);
      const updates = {
        name: 'Jane Doe',
        rating: 5.0
      };
      manager.updateSupervisor(mockSupervisor.id, updates);
      const result = manager.findSupervisors('machine learning');
      expect(result[0].name).toBe('Jane Doe');
      expect(result[0].rating).toBe(5.0);
    });

    it('should throw error when updating non-existent supervisor', () => {
      expect(() => manager.updateSupervisor('non-existent', { name: 'New Name' }))
        .toThrow('Supervisor with id non-existent not found');
    });
  });
});