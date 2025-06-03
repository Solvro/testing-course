import {it, expect, describe, beforeEach } from 'vitest';
import { SupervisorManager, type Supervisor } from './SupervisorManager';

describe('SupervisorManager tests', () => {

  let supervisors: Supervisor[];
  let supervisorManager: SupervisorManager;

  beforeEach(() => {
    supervisors = [
        {
            id: '0',
            name: 'Bob',
            expertiseTopics: ['AI'],
            currentLoad: 0,
            maxLoad: 1,
            rating: 3
        },
        {
            id: '1',
            name: 'John',
            expertiseTopics: ['AI', 'ML'],
            currentLoad: 0,
            maxLoad: 1,
            rating: 2
        },
        {
            id: '2',
            name: 'Brad',
            expertiseTopics: ['AI', 'ML'],
            currentLoad: 0,
            maxLoad: 1,
            rating: 2
        },
        {
            id: '0',
            name: 'Mark',
            expertiseTopics: ['ML'],
            currentLoad: 0,
            maxLoad: 1,
            rating: 5
        }
    ];
    supervisorManager = new SupervisorManager();
  });

  it('should add a supervisior', () => {
    supervisorManager.addSupervisor(supervisors[0]);

    const results = supervisorManager.findSupervisors('Bob');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject(supervisors[0]);
  });

  it('should throw an error when adding supervisor with existing id', () => {
    supervisorManager.addSupervisor(supervisors[0]);

    expect(supervisorManager['supervisors']).toContainEqual(supervisors[0]);
    expect(() => supervisorManager.addSupervisor(supervisors[3])).toThrowError(/already exists/i);
  });

  it('should remove a supervisor by id', () => {
    supervisorManager.addSupervisor(supervisors[0]);
    supervisorManager.addSupervisor(supervisors[1]);
    supervisorManager.removeSupervisor('1');
    
    const results = supervisorManager.findSupervisors('Bob');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject(supervisors[0]);
  });

  it('should throw an error when trying to remove non-existing supervisor', () => {
    expect(() => supervisorManager.removeSupervisor('0')).toThrowError(/not found/i);
  })

  it('should update supervisor fields', () => {
    supervisorManager.addSupervisor(supervisors[0]);
    supervisorManager.updateSupervisor('0', {name: 'Andrew', rating: 2})

    const results = supervisorManager.findSupervisors('Andrew');
    expect(results[0].name).toBe('Andrew');
    expect(results[0].rating).toBe(2);
  })
});