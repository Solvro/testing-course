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
  private supervisors: Supervisor[] = [];

  // Add a new supervisor. If id already exists, throw.
  addSupervisor(sp: Supervisor): void {
    if (this.supervisors.some((s) => s.id === sp.id)) {
      throw new Error(`Supervisor with id ${sp.id} already exists`);
    }
    this.supervisors.push({ ...sp });
  }

  // Remove by id. If not found, throw.
  removeSupervisor(id: string): void {
    const idx = this.supervisors.findIndex((s) => s.id === id);
    if (idx < 0) {
      throw new Error(`Supervisor with id ${id} not found`);
    }
    this.supervisors.splice(idx, 1);
  }

  // Update existing supervisor fields (partial update)
  updateSupervisor(id: string, updates: Partial<Omit<Supervisor, "id">>): void {
    const sp = this.supervisors.find((s) => s.id === id);
    if (!sp) {
      throw new Error(`Supervisor with id ${id} not found`);
    }
    Object.assign(sp, updates);
  }

  // Main search method: match query words to expertiseTopics.
  findSupervisors(query: string, options: SearchOptions = {}): Supervisor[] {
    const { maxResults = Infinity, includeFull = false } = options;
    const terms = SupervisorManager.tokenize(query);

    // Compute a score for each supervisor
    const scored = this.supervisors
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
      // ...existing code...
            .filter(
              ({ sp, matchCount }) =>
                (terms.length === 0 || matchCount > 0) && (includeFull || sp.currentLoad < sp.maxLoad)
            )
      // ...existing code...
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

  // For testing/demo purposes
  clearAll(): void {
    this.supervisors = [];
  }
}
