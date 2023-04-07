from django.shortcuts import render, HttpResponse
# Create your views here.
from yahoo_fin.stock_info import *
import pickle

import yfinance as yf
import pandas as pd
import os
from yahoo_fin.stock_info import *



import requests
import pandas as pd
import plotly

# Strategy class to show whether to buy or sell a stock. Th returns a dataframe of 0 and 1 after call.
class Strategy:
    def __init__(self, df):

        self.close_data = df['Close']
        self.df=df


    def indicator1(self):
        self.df['indicator'] = self.close_data.rolling(window=10).mean()
        self.indicator_data = self.df['indicator']


    def generate_signals(self):
        self.indicator1()
        signals = []
        # print(self.df)
        for i in range(0, len(self.close_data)):
            # print(i)
            if (self.indicator_data[i] > self.close_data[i]
                    and self.indicator_data[i - 1] <= self.close_data[i - 1]):
                # print("BUY")
                signals.append("BUY")
            elif (self.indicator_data[i] < self.close_data[i]
                  and self.indicator_data[i - 1] >= self.close_data[i - 1]):
                signals.append("SELL")
                # print("SELL")
            else:
                signals.append("NO_SIGNAL")
                # print("NO_SIGNAL")
        # print(len(signals))
        self.df['signal'] = signals
        return self.df[self.df['signal'] != 'NO_SIGNAL']

#get data of a particular stockname using yahoo finance API.

def get_data(symbol,period='1d'):
    ticker = yf.Ticker(symbol)
    todays_data = ticker.history(period=period)
    # print(todays_data)
    data = [todays_data['Close'][0],todays_data['Volume'][0],todays_data["Open"][0],todays_data["High"][0],todays_data['Low'][0]]
    return data

# predict the future condition of stock market using a model
def predict_up(data,symb):
    data = [data]

    if os.path.exists(f"prediction/models/{symb}.sav"):
        predictors = ["Close", "Volume", "Open", "High", "Low"]
        df = pd.DataFrame(data, columns=predictors)

        loaded_model = pickle.load(open(f"prediction/models/{symb}.sav", 'rb'))
        result = loaded_model.predict(df)
        return result
    else:

        if os.path.exists(f"prediction/SP/{symb}.csv"):
            sp500 = pd.read_csv(f"prediction/SP/{symb}.csv", index_col=0)
        else:
            sp500 = yf.Ticker(symb)
            sp500 = sp500.history(period="max")
            sp500.to_csv(f"prediction/SP/{symb}.csv")

        sp500.index = pd.to_datetime(sp500.index)
        # print(sp500)
        sp500.plot.line(y="Close", use_index=True)
        del sp500["Dividends"]
        del sp500["Stock Splits"]
        sp500["Tomorrow"] = sp500["Close"].shift(-1)
        sp500["Target"] = (sp500["Tomorrow"] > sp500["Close"]).astype(int)
        sp500 = sp500[50:].copy()
        from sklearn.ensemble import RandomForestClassifier

        model = RandomForestClassifier(n_estimators=100, min_samples_split=100, random_state=1)

        train = sp500.iloc[:-100]
        test = sp500.iloc[-100:]

        predictors = ["Close", "Volume", "Open", "High", "Low"]
        model.fit(train[predictors], train["Target"])
        from sklearn.metrics import precision_score
        # print(type(test[predictors]))
        filename = f"prediction/models/{symb}.sav"
        pickle.dump(model, open(filename, 'wb'))
        df = pd.DataFrame(data, columns=predictors)
        return model.predict(df)

def predict(request):
    if (request.method == "GET"):
        stock_picker = tickers_nifty50()

        return render(request, "predict.html", context={
            'result': stock_picker
        })
    else:

        stock_picker = tickers_nifty50()

        stockname = request.POST.get('symbol', 0)
        # print(stockname)
        # print(get_data(stockname))
        data = get_data(stockname,'1d')

        res = data
        result = predict_up(data,stockname)
        if(result[0]==1):
            flag = True
        else:
            flag = False

        # return HttpResponse("Hii")
        try:
            sp500 = yf.Ticker(stockname)
            sp500 = sp500.history(period="5y")
            strategy = Strategy(sp500)

            data = strategy.generate_signals()
            result = data["signal"].iloc[-1]
            print("Result",result)
        except Exception as e:
            print(e)

        return render(request, "predict.html", context={
            'result':stock_picker,
            'total_val': True,
            'prev_close': res[0],
            'prev_vol': res[1],
            'prev_open': res[2],
            'print': True,
            'strat':result
        })




def calculate(request):
    if(request.method=="GET"):
        stock_picker = tickers_nifty50()

        return render(request, "calc.html", context={
            'result':stock_picker
        })
    else:

        stock_picker = tickers_nifty50()

        stockname = request.POST.get('symbol', 0)
        amount = request.POST.get('amount', 0)
        time = request.POST.get('time', 0)
        if(time == "1 month"):
            period = "1m"
        elif(time == "2 month"):
            period = '2m'
        elif(time == "5 month"):
            period = '5m'
        elif(time == "10 month"):
            period = '10m'
        elif(time == "1 years"):
            period = '1y'
        elif(time == "2 years"):
            period = '2y'
        elif(time == "5 years"):
            period = '5y'
        elif(time == "10 years"):
            period = '10y'
        else:
            period = 0

        res = get_data(stockname, period)
        print(get_data(stockname,period))
        price = res[0]
        res2 = get_data(stockname,period='1d')
        curr_price = res2[0]
        no_of_stocks = round(float(amount)/float(price),2)
        total_val = round(curr_price*no_of_stocks,2)
        print(total_val)
        profit = ((float(total_val) - float(amount))/float(amount)) * 100

        return render(request, "calc.html", context={
            'result': stock_picker,
            'total_val':total_val,
            'invest':amount,
            'time':time,
            'prev_close':round(res[0],2),
            'prev_vol':round(res[1],2),
            'prev_open':round(res[2],2),
            'profit':round(profit,2),
            'print':True
        })





        # print(stockname,amount,time)
        #
        #
        # return HttpResponse("Hiiii")

