// Types
export interface IndexData {
  name: string;
  value: string;
  change: string;
  up: boolean;
  data: Array<{ time: string; value: number }>;
}

export interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  marketCap: string;
  volume: string;
}

export interface TopMover {
  symbol: string;
  name: string;
  price: string;
  change: string;
}

// Market indices data
export const indices: IndexData[] = [
  {
    name: "S&P 500",
    value: "4,567.89",
    change: "+1.23%",
    up: true,
    data: [
      { time: "9:30", value: 4520 },
      { time: "10:00", value: 4535 },
      { time: "10:30", value: 4528 },
      { time: "11:00", value: 4545 },
      { time: "11:30", value: 4540 },
      { time: "12:00", value: 4555 },
      { time: "12:30", value: 4550 },
      { time: "13:00", value: 4560 },
      { time: "13:30", value: 4558 },
      { time: "14:00", value: 4565 },
      { time: "14:30", value: 4562 },
      { time: "15:00", value: 4568 },
    ],
  },
  {
    name: "NASDAQ",
    value: "14,234.56",
    change: "+1.87%",
    up: true,
    data: [
      { time: "9:30", value: 14000 },
      { time: "10:00", value: 14050 },
      { time: "10:30", value: 14080 },
      { time: "11:00", value: 14060 },
      { time: "11:30", value: 14100 },
      { time: "12:00", value: 14090 },
      { time: "12:30", value: 14130 },
      { time: "13:00", value: 14160 },
      { time: "13:30", value: 14150 },
      { time: "14:00", value: 14190 },
      { time: "14:30", value: 14210 },
      { time: "15:00", value: 14235 },
    ],
  },
  {
    name: "DOW JONES",
    value: "35,678.90",
    change: "+0.54%",
    up: true,
    data: [
      { time: "9:30", value: 35500 },
      { time: "10:00", value: 35520 },
      { time: "10:30", value: 35550 },
      { time: "11:00", value: 35580 },
      { time: "11:30", value: 35570 },
      { time: "12:00", value: 35600 },
      { time: "12:30", value: 35620 },
      { time: "13:00", value: 35640 },
      { time: "13:30", value: 35650 },
      { time: "14:00", value: 35660 },
      { time: "14:30", value: 35670 },
      { time: "15:00", value: 35679 },
    ],
  },
  {
    name: "FTSE 100",
    value: "7,456.78",
    change: "-0.32%",
    up: false,
    data: [
      { time: "9:30", value: 7480 },
      { time: "10:00", value: 7475 },
      { time: "10:30", value: 7470 },
      { time: "11:00", value: 7465 },
      { time: "11:30", value: 7468 },
      { time: "12:00", value: 7462 },
      { time: "12:30", value: 7458 },
      { time: "13:00", value: 7460 },
      { time: "13:30", value: 7455 },
      { time: "14:00", value: 7450 },
      { time: "14:30", value: 7458 },
      { time: "15:00", value: 7457 },
    ],
  },
];

// Top movers
export const topGainers: TopMover[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", price: "$485.09", change: "+5.21%" },
  { symbol: "META", name: "Meta Platforms", price: "$334.92", change: "+4.12%" },
  { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%" },
];

export const topLosers: TopMover[] = [
  { symbol: "INTC", name: "Intel Corp.", price: "$42.15", change: "-3.45%" },
  { symbol: "BA", name: "Boeing Co.", price: "$198.34", change: "-2.18%" },
  { symbol: "DIS", name: "Walt Disney", price: "$89.23", change: "-1.56%" },
];

// Index stocks data
export const indexStocks: Record<string, Stock[]> = {
  sp500: [
    { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", marketCap: "$2.8T", volume: "52.3M" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+1.56%", marketCap: "$2.8T", volume: "23.1M" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: "$141.80", change: "+1.12%", marketCap: "$1.8T", volume: "18.7M" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: "$178.25", change: "+0.92%", marketCap: "$1.8T", volume: "31.2M" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "$485.09", change: "+5.21%", marketCap: "$1.2T", volume: "45.8M" },
    { symbol: "META", name: "Meta Platforms", price: "$334.92", change: "+4.12%", marketCap: "$860B", volume: "12.4M" },
    { symbol: "TSLA", name: "Tesla Inc.", price: "$238.45", change: "-0.87%", marketCap: "$756B", volume: "89.2M" },
    { symbol: "BRK.B", name: "Berkshire Hathaway", price: "$356.78", change: "+0.45%", marketCap: "$780B", volume: "3.2M" },
    { symbol: "JPM", name: "JPMorgan Chase", price: "$156.23", change: "+1.23%", marketCap: "$456B", volume: "8.9M" },
    { symbol: "V", name: "Visa Inc.", price: "$258.90", change: "+0.78%", marketCap: "$532B", volume: "5.6M" },
    { symbol: "JNJ", name: "Johnson & Johnson", price: "$156.45", change: "-0.23%", marketCap: "$378B", volume: "6.1M" },
    { symbol: "WMT", name: "Walmart Inc.", price: "$163.89", change: "+0.56%", marketCap: "$432B", volume: "7.8M" },
  ],
  nasdaq: [
    { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", marketCap: "$2.8T", volume: "52.3M" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+1.56%", marketCap: "$2.8T", volume: "23.1M" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: "$141.80", change: "+1.12%", marketCap: "$1.8T", volume: "18.7M" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: "$178.25", change: "+0.92%", marketCap: "$1.8T", volume: "31.2M" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "$485.09", change: "+5.21%", marketCap: "$1.2T", volume: "45.8M" },
    { symbol: "META", name: "Meta Platforms", price: "$334.92", change: "+4.12%", marketCap: "$860B", volume: "12.4M" },
    { symbol: "TSLA", name: "Tesla Inc.", price: "$238.45", change: "-0.87%", marketCap: "$756B", volume: "89.2M" },
    { symbol: "AVGO", name: "Broadcom Inc.", price: "$912.45", change: "+2.89%", marketCap: "$420B", volume: "2.1M" },
    { symbol: "ADBE", name: "Adobe Inc.", price: "$578.23", change: "+1.67%", marketCap: "$256B", volume: "1.8M" },
    { symbol: "NFLX", name: "Netflix Inc.", price: "$478.90", change: "+3.21%", marketCap: "$210B", volume: "4.5M" },
  ],
  dow: [
    { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", marketCap: "$2.8T", volume: "52.3M" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+1.56%", marketCap: "$2.8T", volume: "23.1M" },
    { symbol: "JPM", name: "JPMorgan Chase", price: "$156.23", change: "+1.23%", marketCap: "$456B", volume: "8.9M" },
    { symbol: "V", name: "Visa Inc.", price: "$258.90", change: "+0.78%", marketCap: "$532B", volume: "5.6M" },
    { symbol: "JNJ", name: "Johnson & Johnson", price: "$156.45", change: "-0.23%", marketCap: "$378B", volume: "6.1M" },
    { symbol: "WMT", name: "Walmart Inc.", price: "$163.89", change: "+0.56%", marketCap: "$432B", volume: "7.8M" },
    { symbol: "UNH", name: "UnitedHealth Group", price: "$523.45", change: "+0.89%", marketCap: "$489B", volume: "2.3M" },
    { symbol: "HD", name: "Home Depot", price: "$312.67", change: "+1.12%", marketCap: "$312B", volume: "3.1M" },
    { symbol: "DIS", name: "Walt Disney", price: "$89.23", change: "-1.56%", marketCap: "$163B", volume: "8.9M" },
    { symbol: "BA", name: "Boeing Co.", price: "$198.34", change: "-2.18%", marketCap: "$118B", volume: "5.4M" },
  ],
};

// Recent searches for search overlay
export const recentSearches = ["AAPL", "TSLA", "GOOGL", "MSFT"];

// Popular stocks for search overlay
export const popularStocks = [
  { symbol: "NVDA", name: "NVIDIA Corporation", change: "+3.24%" },
  { symbol: "META", name: "Meta Platforms Inc", change: "+1.87%" },
  { symbol: "AMZN", name: "Amazon.com Inc", change: "+0.92%" },
];
