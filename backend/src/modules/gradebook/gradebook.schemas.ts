/** One graded coursework item in the room gradebook (STORY-013). */
export interface GradeItem {
  type: "assignment" | "quiz";
  /** The graded coursework: an assignment id or a quiz id. */
  itemId: string;
  points: number;
  total: number;
  comment: string | null;
}

export interface StudentGradebook {
  studentId: string;
  items: GradeItem[];
  percentage: number;
}

export interface MyGradebook {
  items: GradeItem[];
  percentage: number;
}
