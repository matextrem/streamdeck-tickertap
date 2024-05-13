# TICKERTAP
A Stream Deck plugin to visualize real-time asset values

[![elgato-marketplace](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fmp-gateway.elgato.com%2Fproducts%3Fname%3DTickertap&query=%24.results.*.download_count&logo=elgato&label=Elgato%20Marketplace
)](https://marketplace.elgato.com/product/tickertap-edbea047-025e-4b44-bc49-5e77d75a270f)
[![publish-package](https://img.shields.io/github/v/release/matextrem/streamdeck-tickertap?logo=github&label=plugin)](https://github.com/matextrem/streamdeck-tickertap/releases/latest)
[![LICENSE](https://img.shields.io/github/license/matextrem/streamdeck-tickertap)](<[https://github.com/matextrem/streamdeck-tickertap/releases/latest](https://github.com/matextrem/streamdeck-tickertap/blob/main/LICENSE.md)>)
[![Buy Me A Coffee](https://img.shields.io/badge/-Buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/matextrem)

<img src="src/images/previews/gallery-previews-01.png" width="1024" />

## Installation

You can install the TickerTap plugin for StreamDeck by following one of the two methods described below:

### Option 1: Manual Download

1. Visit the following URL to download the latest version of the plugin:
   [Download TickerTap](https://github.com/matextrem/streamdeck-tickertap/raw/main/release/com.matextrem.tickertap.streamDeckPlugin)
2. After the download is complete, navigate to your downloads folder.
3. Double-click on `com.matextrem.tickertap.streamDeckPlugin` to install the plugin on your Stream Deck.

### Option 2: Click on the Download Button

Click on the button below to download the latest version of the plugin directly:

<a href="https://github.com/matextrem/streamdeck-tickertap/raw/main/release/com.matextrem.tickertap.streamDeckPlugin">
    <img src="https://i.ibb.co/JHPBTBX/install-button.png" alt="Download TickerTap" width="400" >
</a>

## Features

<img src="src/images/previews/gallery-previews-03.png"  width="768"/>
<img src="src/images/previews/gallery-previews-02.png" width="768" />

- Visualize any real-time stock values.
- Quickly access to the stock's prices you follow.
- Support the following types from [Finvinz](https://finviz.com):

  - Stock
  - Forex
  - Commodities
  - Futures
 
- Support cryptocurrencies from [CoinMarkeCap](https://coinmarketcap.com/)

  **NO API KEY IS NEEDED! 🎊**

## Usage

- Ticker field supports Finvinz website: e.g.
  - Stocks
    - **AAPL** - Apple
    - **GOOGL** - Alphabet
  - Forex
    - **EURUSD** - EUR/USD
    - **XAUUSD** - XAU/USD
  - Commodities
    - **GC** - Gold
    - **SI** - Silver
  - Futures
    - **ES** - E-mini S&P 500
    - **NQ** - E-mini Nasdaq 100
  - Crypto
    - Ticker field supports CoinMarketCap website. You have to get the name from the url: e.g.
         - **BITCOIN** -  coinmarketcap.com/currencies/bitcoin
         - **ETHEREUM** - coinmarketcap.com/currencies/ethereum
         - **THE-GRAPH** - coinmarketcap.com/currencies/the-graph
- Frequency: How often the stock prices are fetched: e.g.
  - **On push** - _Every time the key button is pressed (default)_.
  - **5 minutes** - _Every 5 minutes_.
  - **30 minutes** - _Every 30 minutes_.
  - **1 hour** - _Hourly_.

## Maintainers

- [Mati Dastugue](https://github.com/matextrem) (Developer)
- [Mariana Gurksnis](https://marianagurksnis.com/) (Graphic Designer)

## Contributors

- <https://github.com/matextrem/streamdeck-tickertap/contributors>

## Contributing

For more details about how to contribute, please read
<https://github.com/matextrem/streamdeck-tickertap/blob/main/CONTRIBUTING.md>.

## License

The plugin is available as open source under the terms of the
[MIT License](https://opensource.org/licenses/MIT). A copy of the license can be
found at <https://github.com/matextrem/streamdeck-tickertap/blob/main/LICENSE.md>.

## Code of Conduct

Everyone interacting in the plugin project's codebases, issue trackers, chat
rooms and mailing lists is expected to follow the
[code of conduct](https://github.com/matextrem/plugin/blob/main/CODE_OF_CONDUCT.md).
