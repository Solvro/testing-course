import { describe, it, expect, beforeEach } from 'vitest'
import { SupervisorManager } from './SupervisorManager'

describe('SupervisorManager', () => {
    let supervisorManager, supervisor;

    // Nie dodaję addSupervisor do beforeEach, bo nie każdy test 
    // powinien zaczynać z dodanym supervisorem – dla większej elastyczności.

    beforeEach(() => {
        supervisorManager = new SupervisorManager();
        supervisor = {
            id: '1',
            name: 'Dawid',
            expertiseTopics: ['JavaScript', 'React'],
            rating: 4.5,
            currentLoad: 2,
            maxLoad: 5
        }
    });

    it('should add one supervisor to the list', () => {
        supervisorManager.addSupervisor(supervisor);
        expect(supervisorManager.supervisors.length).toBe(1);
    });

    it('should add two supervisors to the list', () => {
        let supervisor2 = {
            id: '2',
            name: 'Karol',
            expertiseTopics: ['JavaScript', 'React'],
            rating: 4.5,
            currentLoad: 2,
            maxLoad: 5
        }

        supervisorManager.addSupervisor(supervisor);
        supervisorManager.addSupervisor(supervisor2);
        expect(supervisorManager.supervisors.length).toBe(2);
    });

    it('should add one supervisor correctly', () => {
        supervisorManager.addSupervisor(supervisor);
        expect(supervisorManager.supervisors[0]).toEqual(supervisor);
    });

    it('should throw error for adding the same supervisor', () => {
        supervisorManager.addSupervisor(supervisor);
        expect(() => {
            supervisorManager.addSupervisor(supervisor);
        }).toThrowError(/exists/i);
    })
});