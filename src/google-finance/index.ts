import {
    ChartRequestData,
    ChartResponseData,
    DataProvider,
    QuoteResponse,
    ScripMetaData,
    ScripsInfo,
    SubscriptionRequest
} from '../StockDataProvider';

declare var global:any;

let scripsMeta = new Map<string, ScripMetaData>();
const GOOGLE_META_SIZE = 6
const subscriptionId = 0;
export class GoogleFinanceDataProvider implements DataProvider {
    static parseMeta (meta, line){
        if(line.startsWith("EXCHANGE")){
            meta.Exchange = (line.split("%3D")[1]);
        }else if(line.startsWith("MARKET_OPEN_MINUTE")){
            meta.OpenMinute = (parseInt(line.split("=")[1]));
        }else if(line.startsWith("MARKET_CLOSE_MINUTE")){
            meta.CloseMinute = (parseInt(line.split("=")[1]));
        }else if(line.startsWith("INTERVAL")){
            meta.Interval = (parseInt(line.split("=")[1]));
        }else if(line.startsWith("COLUMNS")){
            //TODO: Change this to accept customized columns
        }else if(line.startsWith("TIMEZONE_OFFSET")){
            meta.TimeZoneOffset = (parseInt(line.split("=")[1]));
        }
    }
    sessionCreated() {
        return Promise.resolve(true);
    }
    async getChartData(request:ChartRequestData):Promise<ChartResponseData> {
        var parsedMeta:any = {};
        var lastTime = 0;
        var cumVolume = 0;
        let requiredCount = request.requiredBars;
        //assuming 7 hrs / day = 420 minutes / day = 25200 sec / day
        // let requiredNoOfdays = Math.ceil((request.interval * requiredCount) / 25200); //Doesnt seem to work
        let requiredNoOfdays = 500;
        var result = await fetch(`https://data.traderslab.in/getprices?q=${request.scrip}&i=${request.interval}&p=${requiredNoOfdays}d&f=d,o,h,l,c,v&ts=${request.startTime}`);
        var responseText = await result.text();
        var lines = responseText.split('\n');
        var chartResponse:ChartResponseData = {
            scrip : request.scrip,
            interval : request.interval,
            open : new Array<number>(),
            high : new Array<number>(),
            low : new Array<number>(),
            close : new Array<number>(),
            volume : new Array<number>(),
            timestamp : new Array<number>()
        }
        for(var i=0;i<lines.length-1; i++){
                if(i<=GOOGLE_META_SIZE){
                    GoogleFinanceDataProvider.parseMeta(parsedMeta,lines[i]);
                } else{
                    let time:number;
                    var quotelines = lines[i].split(',');
                    if(quotelines[0].length > 10 && quotelines[0].startsWith('a')){
                        time = lastTime = parseInt(quotelines[0].substr(1));
                        cumVolume = parseInt(quotelines[5]);
                    } else{
                        time = lastTime + (parseInt(quotelines[0]) * parsedMeta.Interval)
                        cumVolume = cumVolume + parseInt(quotelines[5]);
                    }
                    chartResponse.timestamp.push(time * 1000)
                    chartResponse.open.push(parseFloat(quotelines[4]))
                    chartResponse.high.push(parseFloat(quotelines[2]))
                    chartResponse.low.push(parseFloat(quotelines[3]))
                    chartResponse.close.push(parseFloat(quotelines[1]))
                    chartResponse.volume.push(parseFloat(quotelines[5]))
                }
            }
            var meta:ScripMetaData = {
                timezoneOffset : parsedMeta.TimeZoneOffset,
                open : parsedMeta.OpenMinute,
                close : parsedMeta.CloseMinute,
                exchange : parsedMeta.Exchange,
                tradeable : true,
                lotSize : 1,
                tickSize : 0.05
            }
            scripsMeta.set(request.scrip, meta);
            return chartResponse;
    }

    async getAvailableScrips(key:string):Promise<ScripsInfo[]> {
        var results = new Array<ScripsInfo>();
        var response = await fetch('https://data.traderslab.in/match?matchtype=matchall&q='+key);
        var resultJson = await response.json(); 
        if(resultJson.matches && resultJson.matches.length > 0) {
            resultJson.matches.forEach( info=> {
                results.push({
                    scrip : info.t,
                    exchange : info.e,
                    name : info.n
                })
            })
            return results;
        }
        return null;
    }

    subscribeForScrips(request:SubscriptionRequest, callback) {
        return (subscriptionId).toString();
    }

    unSubscribeForScrips(request:SubscriptionRequest, subscriptionId:string) {
        return true;
    }

    getScripMetaData(scrip:string):ScripMetaData {
        return scripsMeta.get(scrip);
    }

    async getQuote(scrip:string, exchange:string):Promise<QuoteResponse> {
        var response = await fetch(`https://data.traderslab.in/info?q=${exchange}:${scrip}`)
        var resultText = await response.text();
        var quote = JSON.parse(resultText.trim().substr(2));
        return {
            scrip:quote[0].t,
            volume:0,
            ltt:0,
            ltp:parseFloat(quote[0].l_fix),
            prevClose:parseFloat(quote[0].pcls_fix)
        }
    }
}

global.DataProvider = new GoogleFinanceDataProvider();

//timestamp