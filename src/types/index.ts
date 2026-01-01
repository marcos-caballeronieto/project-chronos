export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  imageCredit: string;
  story: string;
  funFact: string;
  year: number;
  tags?: string[];
}