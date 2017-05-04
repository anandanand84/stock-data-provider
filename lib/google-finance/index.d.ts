import { ChartRequestData, ChartResponseData, DataProvider, ScripMetaData, ScripsInfo } from '../StockDataProvider';
export declare class GoogleFinanceDataProvider implements DataProvider {
    static parseMeta(meta: any, line: any): void;
    sessionCreated(): Promise<boolean>;
    getChartData(request: ChartRequestData): Promise<ChartResponseData>;
    getAvailableScrips(key: string): Promise<ScripsInfo[]>;
    getScripMetaData(scrip: string): ScripMetaData;
}
