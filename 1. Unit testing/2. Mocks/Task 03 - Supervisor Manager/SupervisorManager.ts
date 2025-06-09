import { db } from "../utils/db";

export interface Supervisor {
  id: string;
  name: string;
  expertiseTopics: string[]; // e.g. ['machine learning', 'nlp']
  rating: number; // 1.0 (low) … 5.0 (high)
  currentLoad: number; // how many theses they're already supervising
  maxLoad: number; // capacity
}

export interface SearchOptions {
  maxResults?: number; // limit on number of matches
  includeFull?: boolean; // whether to include supervisors who are at maxLoad
}

export class SupervisorManager {
  constructor() {
    const now = new Date();

    // NIE USUWAĆ TEGO - poradź sobie mockami :3
    if (now.getHours() < 3 || now.getHours() > 5) {
      throw new Error(
        "Supervisors are only available between 3:00 AM and 5:00 AM"
      );
    }
  }

  // Fetch all supervisors from the database
  private async getAllSupervisors(): Promise<Supervisor[]> {
    return db.sql("SELECT * FROM supervisors") as Promise<Supervisor[]>;
  }

  // Add a new supervisor. If id already exists, throw.
  async addSupervisor(sp: Supervisor): Promise<void> {
    const existingSupervisors = await this.getAllSupervisors();

    console.log(`existingSupervisors`)
    console.log(existingSupervisors)

    if (existingSupervisors.some((s) => s.id === sp.id)) {
      throw new Error(`Supervisor with id ${sp.id} already exists`);
    }

    await db.sql(
      "INSERT INTO supervisors (id, name, expertiseTopics, rating, currentLoad, maxLoad) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        sp.id,
        sp.name,
        sp.expertiseTopics,
        sp.rating,
        sp.currentLoad,
        sp.maxLoad,
      ]
    );
  }

  // Remove by id. If not found, throw.
  async removeSupervisor(id: string): Promise<void> {
    const result = await db.sql("DELETE FROM supervisors WHERE id = $1", [id]);

    // In PostgreSQL, result will have a rowCount property
    if ((result as any).rowCount === 0) {
      throw new Error(`Supervisor with id ${id} not found`);
    }
  }

  // Update existing supervisor fields (partial update)
  async updateSupervisor(
    id: string,
    updates: Partial<Omit<Supervisor, "id">>
  ): Promise<void> {
    const existingSupervisors = await this.getAllSupervisors();
    const sp = existingSupervisors.find((s) => s.id === id);
    if (!sp) {
      throw new Error(`Supervisor with id ${id} not found`);
    }

    // Build the query dynamically based on which fields are being updated
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) return;

    const setClause = updateFields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const values = [
      id,
      ...updateFields.map((field) => (updates as any)[field]),
    ];

    await db.sql(`UPDATE supervisors SET ${setClause} WHERE id = $1`, values);
  }

  // Main search method: match query words to expertiseTopics.
  async findSupervisors(
    query: string,
    options: SearchOptions = {}
  ): Promise<Supervisor[]> {
    const { maxResults = Infinity, includeFull = false } = options;
    const terms = SupervisorManager.tokenize(query);

    // Get all supervisors from the database
    const supervisors = await this.getAllSupervisors();

    // Compute a score for each supervisor
    const scored = supervisors
      .map((sp) => {
        const topicWords = sp.expertiseTopics
          .map((t) => SupervisorManager.tokenize(t))
          .flat();
        const matchCount = terms.reduce(
          (acc, t) => acc + (topicWords.includes(t) ? 1 : 0),
          0
        );
        return { sp, matchCount };
      })
      // Optionally exclude full supervisors
      .filter(
        ({ sp, matchCount }) =>
          includeFull || sp.currentLoad < sp.maxLoad || matchCount > 0
      )
      // Sort by:
      // 1) matchCount desc
      // 2) rating desc
      // 3) name asc
      .sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        if (b.sp.rating !== a.sp.rating) {
          return b.sp.rating - a.sp.rating;
        }
        return a.sp.name.localeCompare(b.sp.name);
      });

    // Return only Supervisor objects, limited
    return scored.slice(0, maxResults).map((x) => x.sp);
  }

  // Helpers
  static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\W_]+/)
      .filter((tok) => tok.length > 0);
  }
}
