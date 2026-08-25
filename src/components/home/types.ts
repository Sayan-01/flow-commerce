export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock: number;
  imageUrl: string | null;
}

export interface WorkflowStep {
  step: string;
  title: string;
  tagline: string;
  desc: string;
  badge: string;
}

export interface ArchitecturePillar {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  highlightColor: "indigo" | "emerald" | "cyan" | "amber";
}
