import { vi, it, expect, describe, beforeEach } from 'vitest'
import { CourseRegistrationService } from './ClassRegistrationService'
import { db } from '../utils/db'

vi.mock('../utils/db', () => ({
  db: {
    sql: vi.fn()
  }
}))

describe('CourseRegistrationService', () => {
    vi.setSystemTime('2023-02-01T00:00:00Z')
    let service
    
    beforeEach(() => {
        service = new CourseRegistrationService();
    });

    it('should return course by id', async () => {
        const mockCourse = {
            id: '1',
            code: 'CODE1',
            name: 'KURS SOLVRO',
            creditHours: 3000000,
            availableSeats: 1,
            prerequisites: [],
            schedule: []
        };

        const dbMock = vi.mocked(db);
        dbMock.sql.mockResolvedValueOnce([mockCourse])

        const result = await service.getCourse('1')
        expect(result).toEqual(mockCourse)
        expect(dbMock.sql).toHaveBeenCalledWith('SELECT * FROM courses WHERE id = $1', ['1'])
    })

    it('should return undefined when course not found', async () => {
        const mockDb = vi.mocked(db)
        mockDb.sql.mockResolvedValueOnce([])

        const result = await service.getCourse('999')
        expect(result).toBeUndefined()
        expect(mockDb.sql).toHaveBeenCalledWith('SELECT * FROM courses WHERE id = $1', ['999'])
    })
})
