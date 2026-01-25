# TICKERTAP

A Stream Deck plugin to visualize real-time asset values

[![Marketplace download badge](https://img.shields.io/badge/dynamic/json?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMjMwIiBoZWlnaHQ9IjIzMCIgdmlld0JveD0iMCAwIDIzMCAyMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02My45NzEgMzguNDgzTDY0LjA5MSAzOC41NzNMMTA5LjY5MiA2NC43NzdDMTA3LjQ1MyA3Ny4yODUgMTAwLjg5NCA4OC43MTIgOTEuMTgzIDk2Ljk3NkM4MS4zMTYgMTA1LjM3MyA2OC43NDkgMTEwIDU1Ljc5MSAxMTBDNDEuMTU5IDExMCAyNy40MDMgMTA0LjI4IDE3LjA1IDkzLjg5MUM2LjcwMiA4My41MDIgMSA2OS42ODYgMSA1NUMxIDQwLjMxNCA2LjcwMiAyNi40OTggMTcuMDQ5IDE2LjEwOUMyNy4zOTYgNS43MiA0MS4xNTIgMCA1NS43OSAwQzY2Ljk3MSAwIDc3LjcyIDMuMzYxIDg2Ljg3OSA5LjcxMUM5NS44MjggMTUuOTE3IDEwMi42NzYgMjQuNTQxIDEwNi42OTEgMzQuNjU0QzEwNy4yMDEgMzUuOTUgMTA3LjY3NSAzNy4yODMgMTA4LjA4OSAzOC42MjFMOTguMzQ4IDQ0LjI4N0M5OC4wMTIgNDIuOTQzIDk3LjYxIDQxLjYwNCA5Ny4xNDggNDAuMzAyQzkwLjk0MiAyMi43NDcgNzQuMzE3IDEwLjk0NyA1NS43OSAxMC45NDdDMzEuNTkxIDEwLjk0NyAxMS45MDUgMzAuNzExIDExLjkwNSA1NUMxMS45MDUgNzkuMjg5IDMxLjU5MSA5OS4wNTMgNTUuNzkgOTkuMDUzQzY1LjE5NCA5OS4wNTMgNzQuMTYyIDk2LjEgODEuNzMgOTAuNTA3Qzg5LjE0MiA4NS4wMjcgOTQuNTc5IDc3LjUxOSA5Ny40NTQgNjguNzk5TDk3LjQ4NCA2OC42MDdMNDQuMzAyIDM4LjA2NFY3MS4xODJMNjIuNjM3IDYwLjU3N0w3Mi4wNzggNjUuOTkxTDQ0LjU5NiA4MS44ODlMMzQuODc5IDc2LjMzMVYzMi45NzRMNDQuNTg0IDI3LjM2Mkw2My45NzYgMzguNDg5TDYzLjk3IDM4LjQ4M0g2My45NzFaIiBmaWxsPSJ3aGl0ZSIvPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTFfNDU2KSI+CjxwYXRoIGQ9Ik0yMzAgOTBDMjMwIDEwMS4wNDYgMjIxLjA0NiAxMTAgMjEwIDExMEMyMDUuOTQyIDExMCAyMDIuMTY2IDEwOC43OTIgMTk5LjAxMyAxMDYuNzE1QzE5NS44NiAxMDQuNjM4IDE5My4zMjkgMTAxLjY5MiAxOTEuNzYyIDk4LjIxOUwxNzcuMjggNjYuMTMxQzE3Ni44ODggNjUuMjYzIDE3Ni4wMTYgNjQuNjU4IDE3NS4wMDEgNjQuNjU4QzE3My45ODYgNjQuNjU4IDE3My4xMTMgNjUuMjY0IDE3Mi43MjIgNjYuMTMzTDE1OC4yNCA5OC4yMTlDMTU1LjEwNSAxMDUuMTY2IDE0OC4xMTggMTEwIDE0MC4wMDEgMTEwQzEyOC45NTYgMTEwIDEyMC4wMDEgMTAxLjA0NiAxMjAuMDAxIDkwQzEyMC4wMDEgODUuOTQyIDEyMS4yMSA4Mi4xNjYgMTIzLjI4NyA3OS4wMTNDMTI1LjM2NCA3NS44NiAxMjguMzEgNzMuMzMgMTMxLjc4MyA3MS43NjJMMTYzLjg3MSA1Ny4yOEMxNjQuNzM5IDU2Ljg4OCAxNjUuMzQzIDU2LjAxNSAxNjUuMzQzIDU1QzE2NS4zNDMgNTMuOTg1IDE2NC43MzggNTMuMTEyIDE2My44NjkgNTIuNzIxTDEzMS43ODIgMzguMjM5QzEyNC44MzUgMzUuMTA0IDEyMCAyOC4xMTcgMTIwIDIwQzEyMCA4Ljk1NSAxMjguOTU1IDAgMTQwIDBDMTQ0LjA1OSAwIDE0Ny44MzUgMS4yMDkgMTUwLjk4OCAzLjI4NkMxNTQuMTQxIDUuMzYzIDE1Ni42NzEgOC4zMDggMTU4LjIzOSAxMS43ODJMMTcyLjcyMSA0My44N0MxNzMuMTEzIDQ0LjczOCAxNzMuOTg2IDQ1LjM0MiAxNzUgNDUuMzQyQzE3Ni4wMTQgNDUuMzQyIDE3Ni44ODkgNDQuNzM3IDE3Ny4yOCA0My44NjhMMTkxLjc2MiAxMS43ODJDMTk0Ljg5NyA0LjgzNSAyMDEuODg0IDAgMjEwIDBDMjIxLjA0NiAwIDIzMCA4Ljk1NSAyMzAgMjBDMjMwIDI0LjA1OCAyMjguNzkxIDI3LjgzNCAyMjYuNzE0IDMwLjk4OEMyMjQuNjM3IDM0LjE0MSAyMjEuNjkyIDM2LjY3MiAyMTguMjE5IDM4LjIzOUwxODYuMTMzIDUyLjcyMUMxODUuMjY0IDUzLjExMiAxODQuNjU4IDUzLjk4NSAxODQuNjU4IDU1QzE4NC42NTggNTYuMTQgMTg1LjM4NiA1Ni45NDMgMTg2LjEzMSA1Ny4yOEwyMTguMjE5IDcxLjc2MkMyMjUuMTY1IDc0Ljg5NyAyMzAgODEuODg0IDIzMCA5MFoiIGZpbGw9IiM0RERBNzkiLz4KPC9nPgo8cGF0aCBkPSJNMTIuNTAxIDEyNUM1LjU5NyAxMjUgMC4wMDEgMTMwLjU5NiAwLjAwMSAxMzcuNUMwLjAwMSAxNDQuNDA0IDUuNTk3IDE1MCAxMi41MDEgMTUwSDc1LjQyMkw5LjA5NCAxOTMuMjMzQzMuNjE5IDE5Ni44MDIgMCAyMDIuOTc4IDAgMjEwQzAgMjIxLjA0NiA4Ljk1NCAyMzAgMjAgMjMwQzI3LjAyMiAyMzAgMzMuMTk4IDIyNi4zOCAzNi43NjYgMjIwLjkwNkw4MC4wMDEgMTU0LjU3OVYyMTcuNUM4MC4wMDEgMjI0LjQwNCA4NS41OTcgMjMwIDkyLjUwMSAyMzBDOTkuNDA1IDIzMCAxMDUuMDAxIDIyNC40MDQgMTA1LjAwMSAyMTcuNVYxMjVIMTIuNTAxWiIgZmlsbD0iI0VBM0I5QyIvPgo8cGF0aCBkPSJNMTc3LjUgMTIwQzE0OC41MDUgMTIwIDEyNSAxNDMuNTA1IDEyNSAxNzIuNVYyMjVIMTc3LjVDMjA2LjQ5NSAyMjUgMjMwIDIwMS40OTUgMjMwIDE3Mi41QzIzMCAxNDMuNTA1IDIwNi40OTUgMTIwIDE3Ny41IDEyMFoiIGZpbGw9IiNGNEI2MzUiLz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTFfNDU2Ij4KPHJlY3Qgd2lkdGg9IjExMCIgaGVpZ2h0PSIxMTAiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMjApIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==&query=download_count&suffix=%20Downloads&label=Marketplace&labelColor=151515&color=204cfe&url=https%3A%2F%2Fmp-gateway.elgato.com%2Fproducts%2Fedbea047-025e-4b44-bc49-5e77d75a270f "Marketplace download badge")](https://marketplace.elgato.com/product/tickertap-edbea047-025e-4b44-bc49-5e77d75a270f)
[![publish-package](https://img.shields.io/github/v/release/matextrem/streamdeck-tickertap?logo=github&label=plugin)](https://github.com/matextrem/streamdeck-tickertap/releases/latest)
[![LICENSE](https://img.shields.io/github/license/matextrem/streamdeck-tickertap)](<[https://github.com/matextrem/streamdeck-tickertap/releases/latest](https://github.com/matextrem/streamdeck-tickertap/blob/main/LICENSE.md)>)
[![Buy Me A Coffee](https://img.shields.io/badge/-Buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/matextrem)

<img src="src/images/previews/gallery previews_01.png" width="1024" />

## Installation

You can install the TickerTap plugin for StreamDeck by following one of the two methods described below:

### Option 1: Manual Download

1. Visit the following URL to download the latest version of the plugin:
   [Download TickerTap](https://marketplace.elgato.com/product/tickertap-edbea047-025e-4b44-bc49-5e77d75a270f)
2. After the download is complete, navigate to your downloads folder.
3. Double-click on `com.matextrem.tickertap.streamDeckPlugin` to install the plugin on your Stream Deck.

### Option 2: Click on the Download Button

Click on the button below to download the latest version of the plugin directly:

<a href="https://github.com/matextrem/streamdeck-tickertap/raw/main/release/com.matextrem.tickertap.streamDeckPlugin">
    <img src="https://i.ibb.co/JHPBTBX/install-button.png" alt="Download TickerTap" width="400" >
</a>

## Features

<img src="src/images/previews/gallery previews_03.png"  width="768"/>
<img src="src/images/previews/gallery previews_02.png" width="768" />

- Visualize any real-time asset values.
- Quick access to the asset prices you follow.
- Support the following types from [Finvinz](https://finviz.com) (American market) and [Investing.com](https://www.investing.com/) (European and Asian markets):
  - Stock
  - ETF
  - Forex
  - Commodities
  - Futures
  - Funds
  - Bonds
- Support cryptocurrencies from [CoinMarketCap](https://coinmarketcap.com/)

  **NO API KEY IS NEEDED! 🎊**

## Usage

- Ticker field supports Finvinz and Investing.com (for Europe and Asia markets) websites: e.g.
  - Stocks
    - **AAPL** - Apple
    - **GOOGL** - Alphabet
  - ETF
    - Ticker field supports Investing.com website. You have to get the name from the url: e.g.
      - **SPDR-S-P-500** - investing.com/etfs/spdr-s-p-500
      - **ISHARES-FTSE-100** - investing.com/etfs/ishares-ftse-100
    - _Note:_ If the Investing.com URL contains the _?cid=x_ part, ensure that you include it in the ticker field: e.g.
      - **CS-ETF-(IE)-ON-S-P-500?CID=45844** - investing.com/etfs/cs-etf-(ie)-on-s-p-500?cid=45844
  - Forex
    - **EURUSD** - EUR/USD
    - **XAUUSD** - XAU/USD
  - Commodities
    - **GC** - Gold
    - **SI** - Silver
  - Futures
    - **ES** - E-mini S&P 500
    - **NQ** - E-mini Nasdaq 100
  - Funds
    - Ticker field supports Investing.com website. You have to get the name from the url: e.g.
      - **VANGUARD-TOTAL-STOCK-MARKET-INS-PLS** - investing.com/funds/vanguard-total-stock-market-ins-pls
      - **BAILLIE GIFFORD MANAGED FUND B ACC** - investing.com/funds/baillie-gifford-managed-b-acc
  - Bonds
    - Ticker field supports Investing.com website. You have to get the name from the url: e.g.
      - **U.S.-10-YEAR-BOND-YIELD** - investing.com/funds/u.s.-10-year-bond-yield
      - **U.S.-30-YEAR-BOND-YIELD** - investing.com/funds/u.s.-30-year-bond-yield
  - Crypto
    - Ticker field supports CoinMarketCap website. You have to get the name from the url: e.g.
      - **BITCOIN** - coinmarketcap.com/currencies/bitcoin
      - **ETHEREUM** - coinmarketcap.com/currencies/ethereum
      - **THE-GRAPH** - coinmarketcap.com/currencies/the-graph
- Region: Select the region where the stocks market is from:

  - **America** - United States
  - **Canada** - Canada
  - **Europe** - European Union and UK
  - **Asia/Pacific** - Asia and Pacific

  **Note:** For EU and Asia markets, the ticker should be extracted from Investing.com url: e.g.

  - **BASF-AG** - investing.com/equities/basf-ag
  - **IHI-CORP.** - investing.com/equities/ihi-corp.

- Show as: Add custom ticker - e.g **GOLD**.
- Icon: Show/Hide the ticker icon if exists.
- Frequency: How often the stock prices are fetched: e.g.
  - **On push** - _Every time the key button is pressed (default)_.
  - **5 minutes** - _Every 5 minutes_.
  - **30 minutes** - _Every 30 minutes_.
  - **1 hour** - _Hourly_.
  - **Custom** - _Specify a custom interval in seconds (e.g., 10 seconds)_.
- Currency: Select the currency you want to use for the price display (Only for Crypto)
- Gradient: Show/Hide the gradient background color on the tile
- Total: Show/Hide the amount owned multiplied by the price
  - **Amount** - Amount owned
- Rising/Falling colors: Let you choose the color you want for Rising/Falling stocks.

**_Note_: Long pressed the key button redirects to the ticker website.**

## Maintainers

- [Mati Dastugue](https://github.com/matextrem) (Developer)
- [Mariana Gurksnis](https://gurksnis.design/) (Graphic Designer)

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
