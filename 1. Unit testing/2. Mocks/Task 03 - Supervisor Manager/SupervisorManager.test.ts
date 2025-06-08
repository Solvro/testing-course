import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SupervisorManager, type Supervisor } from './SupervisorManager';
import { db } from '../utils/db';

vi.mock('../utils/db');

describe('SupervisorManager tests', () => {
  let supervisorManager: SupervisorManager;
  const currentDate = new Date('2025-07-15 04:00:00').toISOString();
  let sampleSupervisors: Supervisor[];

  beforeEach(async () => {
    vi.setSystemTime(currentDate);
    supervisorManager = new SupervisorManager();

    sampleSupervisors = [
      {
        id: 'SP001',
        name: 'John Doe',
        expertiseTopics: ['machine learning', 'nlp'],
        rating: 4.5,
        currentLoad: 2,
        maxLoad: 5,
      },
      {
        id: 'SP002',
        name: 'Jane Smith',
        expertiseTopics: ['data science', 'statistics'],
        rating: 4.8,
        currentLoad: 5, // at max load
        maxLoad: 5,
      },
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when created outside of 3-5 AM', () => {
    vi.setSystemTime(new Date('2025-07-15 10:00:00'));
    expect(() => new SupervisorManager()).toThrow(
      'Supervisors are only available between 3:00 AM and 5:00 AM'
    );
  });

  it('should add a new supervisor', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce([]); // getAllSupervisors
    vi.mocked(db.sql).mockResolvedValueOnce([{ rowCount: 1 }]); // insert

    await supervisorManager.addSupervisor(sampleSupervisors[0]);
    expect(db.sql).toHaveBeenCalledWith(
      'INSERT INTO supervisors (id, name, expertiseTopics, rating, currentLoad, maxLoad) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        sampleSupervisors[0].id,
        sampleSupervisors[0].name,
        sampleSupervisors[0].expertiseTopics,
        sampleSupervisors[0].rating,
        sampleSupervisors[0].currentLoad,
        sampleSupervisors[0].maxLoad,
      ]
    );
  });

  it('should throw error when adding supervisor with existing ID', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce([sampleSupervisors[0]]); // getAllSupervisors

    await expect(
      supervisorManager.addSupervisor(sampleSupervisors[0])
    ).rejects.toThrow(
      `Supervisor with id ${sampleSupervisors[0].id} already exists`
    );
  });

  it('should remove a supervisor', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce([{ rowCount: 1 }]); // delete

    await supervisorManager.removeSupervisor(sampleSupervisors[0].id);
    expect(db.sql).toHaveBeenCalledWith(
      'DELETE FROM supervisors WHERE id = $1',
      [sampleSupervisors[0].id]
    );
  });

  it('should update supervisor fields', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce([sampleSupervisors[0]]); // getAllSupervisors
    vi.mocked(db.sql).mockResolvedValueOnce([{ rowCount: 1 }]); // update

    const updates = {
      name: 'Updated Name',
      rating: 4.9,
    };

    await supervisorManager.updateSupervisor(sampleSupervisors[0].id, updates);
    expect(db.sql).toHaveBeenCalledWith(
      'UPDATE supervisors SET name = $2, rating = $3 WHERE id = $1',
      [sampleSupervisors[0].id, updates.name, updates.rating]
    );
  });

  it('should throw error when updating non-existent supervisor', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce([]); // getAllSupervisors

    await expect(
      supervisorManager.updateSupervisor('NONEXISTENT', { name: 'New Name' })
    ).rejects.toThrow('Supervisor with id NONEXISTENT not found');
  });

  it('should find supervisors matching query', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce(sampleSupervisors); // getAllSupervisors

    const result = await supervisorManager.findSupervisors('machine learning');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('SP001');
  });

  it('should respect maxResults option', async () => {
    vi.mocked(db.sql).mockResolvedValueOnce(sampleSupervisors); // getAllSupervisors

    const result = await supervisorManager.findSupervisors('data', {
      maxResults: 1,
    });
    expect(result).toHaveLength(1);
  });
});
