import pandas as pd
# from nsetools import Nse
import os
#os.environ['http_proxy'] = "http://142051002:ayyappa18@172.18.61.10:3128"
#os.environ['https_proxy'] = "http://142051002:ayyappa18@172.18.61.10:3128"

# nse = Nse()

def top_gainers():
    top_gainers = pd.read_html('https://finance.yahoo.com/gainers')[0].T[0:9].T[0:10].to_html()
    return top_gainers


def top_losers():
    top_losers = pd.read_html('https://finance.yahoo.com/losers')[0].T[0:9].T[0:10].to_html()
    return top_losers


def main():
    top_gainers()
    top_losers()

if __name__ == '__main__':
    main()
