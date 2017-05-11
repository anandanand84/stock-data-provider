export interface ScripMetaData {
    open:number
    close:number
    exchange:string
    timezoneOffset:number
}

export interface ChartResponseData {
    scrip : string
    interval : number
    open : number[]
    high : number[]
    low : number[]
    close : number[]
    volume : number[],
    timestamp: number[]
}

export interface ScripsInfo {
    scrip : string,
    name : string,
    exchange : string
}

export interface ChartRequestData {
    interval: number
    requiredBars: number
    scrip: string
    startTime?: number
}

export interface SubscriptionRequest {
    scrip: string
    exchange: string,
    subscribe: boolean
}

export interface SubscriptionResponse {
    ltp: string
    ltt: string,
    scrip : string,
    exchange : string
    volume: number
}

export interface QuoteResponse {
    scrip:string
    volume:number
    ltt:number
    ltp:number
    prevClose:number
}

export interface DataProvider {
    sessionCreated: ()=>Promise<boolean>;
    getChartData:(request:ChartRequestData)=>Promise<ChartResponseData>
    getAvailableScrips:(key:string)=>Promise<ScripsInfo[]>
    getScripMetaData:(scrip:string)=>ScripMetaData
    subscribeForScrips:(request:SubscriptionRequest, callback:(topic:string, tick:SubscriptionResponse)=>void)=>string;
    unSubscribeForScrips:(request:SubscriptionRequest, subscriptionId:string)=>boolean;
    getQuote:(scrip:string, exchange:string)=>Promise<QuoteResponse>;
}