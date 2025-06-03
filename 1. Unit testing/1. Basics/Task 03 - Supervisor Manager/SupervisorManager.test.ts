import { describe, it, expect, beforeEach } from 'vitest';
import { SupervisorManager, Supervisor } from './SupervisorManager';

describe('SupervisorManager.addSupervisor', () => {
    let manager: SupervisorManager;
    const supervisor: Supervisor = {
        id: '1',
        name: 'Alice',
        expertiseTopics: ['machine learning', 'ai'],
        rating: 4.5,
        currentLoad: 1,
        maxLoad: 3,
    };

    beforeEach(() => {
        manager = new SupervisorManager();
        manager.clearAll();
    });

    it('should add a supervisor successfully', () => {
        manager.addSupervisor(supervisor);
        const found = manager.findSupervisors('machine learning');
        expect(found).toHaveLength(1);
        expect(found[0]).toMatchObject(supervisor);
    });

    it('should throw if supervisor with the same id already exists', () => {
        manager.addSupervisor(supervisor);
        expect(() => manager.addSupervisor(supervisor)).toThrowError(
            `Supervisor with id ${supervisor.id} already exists`
        );
    });

    it('should not mutate the original supervisor object', () => {
        const original = { ...supervisor };
        manager.addSupervisor(supervisor);
        supervisor.name = 'Changed';
        const found = manager.findSupervisors('machine learning');
        expect(found[0].name).toBe(original.name);
    });

    it('should allow adding multiple supervisors with different ids', () => {
        const supervisor2: Supervisor = {
            id: '2',
            name: 'Bob',
            expertiseTopics: ['nlp'],
            rating: 4.0,
            currentLoad: 0,
            maxLoad: 2,
        };
        manager.addSupervisor(supervisor);
        manager.addSupervisor(supervisor2);
        const found = manager.findSupervisors('');
        expect(found).toHaveLength(2);
        expect(found.map(s => s.id)).toContain('1');
        expect(found.map(s => s.id)).toContain('2');
    });

    it('should throw if supervisor id is the same but other fields differ', () => {
        manager.addSupervisor(supervisor);
        const supervisorDuplicate: Supervisor = {
            ...supervisor,
            name: 'Different Name',
        };
        expect(() => manager.addSupervisor(supervisorDuplicate)).toThrowError(
            `Supervisor with id ${supervisor.id} already exists`
        );
    });
});