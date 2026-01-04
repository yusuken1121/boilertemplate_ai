export interface Annotation {
  term: string;
  definition: string;
}

export interface FlowchartData {
  title: string;
  summary: string;
  category: string;
  mermaidCode: string;
  annotations: Annotation[];
}
