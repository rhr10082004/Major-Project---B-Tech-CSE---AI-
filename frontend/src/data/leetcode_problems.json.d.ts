declare const problems: Array<{
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  description: string;
  starterCode: Record<string, string>;
  testCases: Array<{ input: string; expectedOutput: string }>;
}>;

export default problems;
