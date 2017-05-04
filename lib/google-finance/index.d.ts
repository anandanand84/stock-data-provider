import { ChartRequestData, ChartResponseData, DataProvider, ScripMetaData, ScripsInfo, SubscriptionRequest } from '../StockDataProvider';
export declare class GoogleFinanceDataProvider implements DataProvider {
    static parseMeta(meta: any, line: any): void;
    sessionCreated(): Promise<boolean>;
    getChartData(request: ChartRequestData): Promise<ChartResponseData>;
    getAvailableScrips(key: string): Promise<ScripsInfo[]>;
    subscribeForScrips(request: SubscriptionRequest, callback: any): string;
    unSubscribeForScrips(request: SubscriptionRequest, subscriptionId: string): boolean;
    getScripMetaData(scrip: string): ScripMetaData;
}
