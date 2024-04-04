// types.ts
export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface Answers {
  [key: number]: string;
}
