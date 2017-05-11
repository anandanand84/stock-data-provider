(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let scripsMeta = new Map();
const GOOGLE_META_SIZE = 6;
const subscriptionId = 0;
class GoogleFinanceDataProvider {
    static parseMeta(meta, line) {
        if (line.startsWith("EXCHANGE")) {
            meta.Exchange = (line.split("%3D")[1]);
        }
        else if (line.startsWith("MARKET_OPEN_MINUTE")) {
            meta.OpenMinute = (parseInt(line.split("=")[1]));
        }
        else if (line.startsWith("MARKET_CLOSE_MINUTE")) {
            meta.CloseMinute = (parseInt(line.split("=")[1]));
        }
        else if (line.startsWith("INTERVAL")) {
            meta.Interval = (parseInt(line.split("=")[1]));
        }
        else if (line.startsWith("COLUMNS")) {
            //TODO: Change this to accept customized columns
        }
        else if (line.startsWith("TIMEZONE_OFFSET")) {
            meta.TimeZoneOffset = (parseInt(line.split("=")[1]));
        }
    }
    sessionCreated() {
        return Promise.resolve(true);
    }
    getChartData(request) {
        return __awaiter(this, void 0, void 0, function* () {
            var parsedMeta = {};
            var lastTime = 0;
            var cumVolume = 0;
            let requiredCount = request.requiredBars;
            //assuming 7 hrs / day = 420 minutes / day = 25200 sec / day
            // let requiredNoOfdays = Math.ceil((request.interval * requiredCount) / 25200); //Doesnt seem to work
            let requiredNoOfdays = 500;
            var result = yield fetch(`https://crossorigin.me/https://www.google.com/finance/getprices?q=${request.scrip}&i=${request.interval}&p=${requiredNoOfdays}d&f=d,o,h,l,c,v&ts=${request.startTime}`);
            var responseText = yield result.text();
            var lines = responseText.split('\n');
            var chartResponse = {
                scrip: request.scrip,
                interval: request.interval,
                open: new Array(),
                high: new Array(),
                low: new Array(),
                close: new Array(),
                volume: new Array(),
                timestamp: new Array()
            };
            for (var i = 0; i < lines.length - 1; i++) {
                if (i <= GOOGLE_META_SIZE) {
                    GoogleFinanceDataProvider.parseMeta(parsedMeta, lines[i]);
                }
                else {
                    let time;
                    var quotelines = lines[i].split(',');
                    if (quotelines[0].length > 10 && quotelines[0].startsWith('a')) {
                        time = lastTime = parseInt(quotelines[0].substr(1));
                        cumVolume = parseInt(quotelines[5]);
                    }
                    else {
                        time = lastTime + (parseInt(quotelines[0]) * parsedMeta.Interval);
                        cumVolume = cumVolume + parseInt(quotelines[5]);
                    }
                    chartResponse.timestamp.push(time * 1000);
                    chartResponse.open.push(parseFloat(quotelines[4]));
                    chartResponse.high.push(parseFloat(quotelines[2]));
                    chartResponse.low.push(parseFloat(quotelines[3]));
                    chartResponse.close.push(parseFloat(quotelines[1]));
                    chartResponse.volume.push(parseFloat(quotelines[5]));
                }
            }
            var meta = {
                timezoneOffset: parsedMeta.TimeZoneOffset,
                open: parsedMeta.OpenMinute,
                close: parsedMeta.CloseMinute,
                exchange: parsedMeta.Exchange
            };
            scripsMeta.set(request.scrip, meta);
            return chartResponse;
        });
    }
    getAvailableScrips(key) {
        return __awaiter(this, void 0, void 0, function* () {
            var results = new Array();
            var response = yield fetch('https://crossorigin.me/https://www.google.com/finance/match?matchtype=matchall&q=' + key);
            var resultJson = yield response.json();
            if (resultJson.matches && resultJson.matches.length > 0) {
                resultJson.matches.forEach(info => {
                    results.push({
                        scrip: info.t,
                        exchange: info.e,
                        name: info.n
                    });
                });
                return results;
            }
            return null;
        });
    }
    subscribeForScrips(request, callback) {
        return (subscriptionId).toString();
    }
    unSubscribeForScrips(request, subscriptionId) {
        return true;
    }
    getScripMetaData(scrip) {
        return scripsMeta.get(scrip);
    }
    getQuote(scrip, exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            var response = yield fetch(`https://crossorigin.me/https://www.google.com/finance/info?q=${exchange}:${scrip}`);
            var resultText = yield response.text();
            console.log(resultText);
            var quote = JSON.parse(resultText.trim().substr(2));
            return {
                scrip: quote[0].t,
                volume: 0,
                ltt: 0,
                ltp: parseFloat(quote[0].l_fix),
                prevClose: parseFloat(quote[0].pcls_fix)
            };
        });
    }
}
exports.GoogleFinanceDataProvider = GoogleFinanceDataProvider;
global.DataProvider = new GoogleFinanceDataProvider();
//timestamp 

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvZ29vZ2xlLWZpbmFuY2UvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHJlc3VsdC52YWx1ZSk7IH0pLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmxldCBzY3JpcHNNZXRhID0gbmV3IE1hcCgpO1xuY29uc3QgR09PR0xFX01FVEFfU0laRSA9IDY7XG5jb25zdCBzdWJzY3JpcHRpb25JZCA9IDA7XG5jbGFzcyBHb29nbGVGaW5hbmNlRGF0YVByb3ZpZGVyIHtcbiAgICBzdGF0aWMgcGFyc2VNZXRhKG1ldGEsIGxpbmUpIHtcbiAgICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcIkVYQ0hBTkdFXCIpKSB7XG4gICAgICAgICAgICBtZXRhLkV4Y2hhbmdlID0gKGxpbmUuc3BsaXQoXCIlM0RcIilbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcIk1BUktFVF9PUEVOX01JTlVURVwiKSkge1xuICAgICAgICAgICAgbWV0YS5PcGVuTWludXRlID0gKHBhcnNlSW50KGxpbmUuc3BsaXQoXCI9XCIpWzFdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiTUFSS0VUX0NMT1NFX01JTlVURVwiKSkge1xuICAgICAgICAgICAgbWV0YS5DbG9zZU1pbnV0ZSA9IChwYXJzZUludChsaW5lLnNwbGl0KFwiPVwiKVsxXSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aChcIklOVEVSVkFMXCIpKSB7XG4gICAgICAgICAgICBtZXRhLkludGVydmFsID0gKHBhcnNlSW50KGxpbmUuc3BsaXQoXCI9XCIpWzFdKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiQ09MVU1OU1wiKSkge1xuICAgICAgICAgICAgLy9UT0RPOiBDaGFuZ2UgdGhpcyB0byBhY2NlcHQgY3VzdG9taXplZCBjb2x1bW5zXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKFwiVElNRVpPTkVfT0ZGU0VUXCIpKSB7XG4gICAgICAgICAgICBtZXRhLlRpbWVab25lT2Zmc2V0ID0gKHBhcnNlSW50KGxpbmUuc3BsaXQoXCI9XCIpWzFdKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2Vzc2lvbkNyZWF0ZWQoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgfVxuICAgIGdldENoYXJ0RGF0YShyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB2YXIgcGFyc2VkTWV0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICAgICAgICAgIHZhciBjdW1Wb2x1bWUgPSAwO1xuICAgICAgICAgICAgbGV0IHJlcXVpcmVkQ291bnQgPSByZXF1ZXN0LnJlcXVpcmVkQmFycztcbiAgICAgICAgICAgIC8vYXNzdW1pbmcgNyBocnMgLyBkYXkgPSA0MjAgbWludXRlcyAvIGRheSA9IDI1MjAwIHNlYyAvIGRheVxuICAgICAgICAgICAgLy8gbGV0IHJlcXVpcmVkTm9PZmRheXMgPSBNYXRoLmNlaWwoKHJlcXVlc3QuaW50ZXJ2YWwgKiByZXF1aXJlZENvdW50KSAvIDI1MjAwKTsgLy9Eb2VzbnQgc2VlbSB0byB3b3JrXG4gICAgICAgICAgICBsZXQgcmVxdWlyZWROb09mZGF5cyA9IDUwMDtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB5aWVsZCBmZXRjaChgaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9odHRwczovL3d3dy5nb29nbGUuY29tL2ZpbmFuY2UvZ2V0cHJpY2VzP3E9JHtyZXF1ZXN0LnNjcmlwfSZpPSR7cmVxdWVzdC5pbnRlcnZhbH0mcD0ke3JlcXVpcmVkTm9PZmRheXN9ZCZmPWQsbyxoLGwsYyx2JnRzPSR7cmVxdWVzdC5zdGFydFRpbWV9YCk7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2VUZXh0ID0geWllbGQgcmVzdWx0LnRleHQoKTtcbiAgICAgICAgICAgIHZhciBsaW5lcyA9IHJlc3BvbnNlVGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICB2YXIgY2hhcnRSZXNwb25zZSA9IHtcbiAgICAgICAgICAgICAgICBzY3JpcDogcmVxdWVzdC5zY3JpcCxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogcmVxdWVzdC5pbnRlcnZhbCxcbiAgICAgICAgICAgICAgICBvcGVuOiBuZXcgQXJyYXkoKSxcbiAgICAgICAgICAgICAgICBoaWdoOiBuZXcgQXJyYXkoKSxcbiAgICAgICAgICAgICAgICBsb3c6IG5ldyBBcnJheSgpLFxuICAgICAgICAgICAgICAgIGNsb3NlOiBuZXcgQXJyYXkoKSxcbiAgICAgICAgICAgICAgICB2b2x1bWU6IG5ldyBBcnJheSgpLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IEFycmF5KClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpIDw9IEdPT0dMRV9NRVRBX1NJWkUpIHtcbiAgICAgICAgICAgICAgICAgICAgR29vZ2xlRmluYW5jZURhdGFQcm92aWRlci5wYXJzZU1ldGEocGFyc2VkTWV0YSwgbGluZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRpbWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdW90ZWxpbmVzID0gbGluZXNbaV0uc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHF1b3RlbGluZXNbMF0ubGVuZ3RoID4gMTAgJiYgcXVvdGVsaW5lc1swXS5zdGFydHNXaXRoKCdhJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUgPSBsYXN0VGltZSA9IHBhcnNlSW50KHF1b3RlbGluZXNbMF0uc3Vic3RyKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1bVZvbHVtZSA9IHBhcnNlSW50KHF1b3RlbGluZXNbNV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZSA9IGxhc3RUaW1lICsgKHBhcnNlSW50KHF1b3RlbGluZXNbMF0pICogcGFyc2VkTWV0YS5JbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdW1Wb2x1bWUgPSBjdW1Wb2x1bWUgKyBwYXJzZUludChxdW90ZWxpbmVzWzVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjaGFydFJlc3BvbnNlLnRpbWVzdGFtcC5wdXNoKHRpbWUgKiAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgY2hhcnRSZXNwb25zZS5vcGVuLnB1c2gocGFyc2VGbG9hdChxdW90ZWxpbmVzWzRdKSk7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0UmVzcG9uc2UuaGlnaC5wdXNoKHBhcnNlRmxvYXQocXVvdGVsaW5lc1syXSkpO1xuICAgICAgICAgICAgICAgICAgICBjaGFydFJlc3BvbnNlLmxvdy5wdXNoKHBhcnNlRmxvYXQocXVvdGVsaW5lc1szXSkpO1xuICAgICAgICAgICAgICAgICAgICBjaGFydFJlc3BvbnNlLmNsb3NlLnB1c2gocGFyc2VGbG9hdChxdW90ZWxpbmVzWzFdKSk7XG4gICAgICAgICAgICAgICAgICAgIGNoYXJ0UmVzcG9uc2Uudm9sdW1lLnB1c2gocGFyc2VGbG9hdChxdW90ZWxpbmVzWzVdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1ldGEgPSB7XG4gICAgICAgICAgICAgICAgdGltZXpvbmVPZmZzZXQ6IHBhcnNlZE1ldGEuVGltZVpvbmVPZmZzZXQsXG4gICAgICAgICAgICAgICAgb3BlbjogcGFyc2VkTWV0YS5PcGVuTWludXRlLFxuICAgICAgICAgICAgICAgIGNsb3NlOiBwYXJzZWRNZXRhLkNsb3NlTWludXRlLFxuICAgICAgICAgICAgICAgIGV4Y2hhbmdlOiBwYXJzZWRNZXRhLkV4Y2hhbmdlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2NyaXBzTWV0YS5zZXQocmVxdWVzdC5zY3JpcCwgbWV0YSk7XG4gICAgICAgICAgICByZXR1cm4gY2hhcnRSZXNwb25zZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldEF2YWlsYWJsZVNjcmlwcyhrZXkpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KCk7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaCgnaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9odHRwczovL3d3dy5nb29nbGUuY29tL2ZpbmFuY2UvbWF0Y2g/bWF0Y2h0eXBlPW1hdGNoYWxsJnE9JyArIGtleSk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0SnNvbiA9IHlpZWxkIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHRKc29uLm1hdGNoZXMgJiYgcmVzdWx0SnNvbi5tYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHRKc29uLm1hdGNoZXMuZm9yRWFjaChpbmZvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwOiBpbmZvLnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNoYW5nZTogaW5mby5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogaW5mby5uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzdWJzY3JpYmVGb3JTY3JpcHMocmVxdWVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIChzdWJzY3JpcHRpb25JZCkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgdW5TdWJzY3JpYmVGb3JTY3JpcHMocmVxdWVzdCwgc3Vic2NyaXB0aW9uSWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGdldFNjcmlwTWV0YURhdGEoc2NyaXApIHtcbiAgICAgICAgcmV0dXJuIHNjcmlwc01ldGEuZ2V0KHNjcmlwKTtcbiAgICB9XG4gICAgZ2V0UXVvdGUoc2NyaXAsIGV4Y2hhbmdlKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaChgaHR0cHM6Ly9jcm9zc29yaWdpbi5tZS9odHRwczovL3d3dy5nb29nbGUuY29tL2ZpbmFuY2UvaW5mbz9xPSR7ZXhjaGFuZ2V9OiR7c2NyaXB9YCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0VGV4dCA9IHlpZWxkIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdFRleHQpO1xuICAgICAgICAgICAgdmFyIHF1b3RlID0gSlNPTi5wYXJzZShyZXN1bHRUZXh0LnRyaW0oKS5zdWJzdHIoMikpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzY3JpcDogcXVvdGVbMF0udCxcbiAgICAgICAgICAgICAgICB2b2x1bWU6IDAsXG4gICAgICAgICAgICAgICAgbHR0OiAwLFxuICAgICAgICAgICAgICAgIGx0cDogcGFyc2VGbG9hdChxdW90ZVswXS5sX2ZpeCksXG4gICAgICAgICAgICAgICAgcHJldkNsb3NlOiBwYXJzZUZsb2F0KHF1b3RlWzBdLnBjbHNfZml4KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5Hb29nbGVGaW5hbmNlRGF0YVByb3ZpZGVyID0gR29vZ2xlRmluYW5jZURhdGFQcm92aWRlcjtcbmdsb2JhbC5EYXRhUHJvdmlkZXIgPSBuZXcgR29vZ2xlRmluYW5jZURhdGFQcm92aWRlcigpO1xuLy90aW1lc3RhbXAgXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXX0=
