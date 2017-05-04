export interface ScripMetaData {
    open: number;
    close: number;
    exchange: string;
    timezoneOffset: number;
}
export interface ChartResponseData {
    scrip: string;
    interval: number;
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
    timestamp: number[];
}
export interface ScripsInfo {
    scrip: string;
    name: string;
    exchange: string;
}
export interface ChartRequestData {
    interval: number;
    requiredBars: number;
    scrip: string;
    startTime?: number;
}
export interface DataProvider {
    sessionCreated: () => Promise<boolean>;
    getChartData: (request: ChartRequestData) => Promise<ChartResponseData>;
    getAvailableScrips: (key: string) => Promise<ScripsInfo[]>;
    getScripMetaData: (scrip: string) => ScripMetaData;
}
