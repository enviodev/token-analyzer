# Token Analyzer

## Tasks

- Indexer
  - [ ] Token
    - [ ] Balance tracking
    - [ ] Mint & burn tracking
      - [ ] Last 7 days, hourly granularity
      - [ ] Prune entities older than 7 days (storage optimization)
  - [ ] Transfer tracking
    - [ ] Recent transfers (store latest 100)
      - [ ] Apply storage optimization
    - [ ] Top transfers by token amount (excluding mints/burns, store latest 100)
      - [ ] Apply storage optimization
  - [ ] Transfer volume metrics
    - [ ] Global cumulative volume
    - [ ] Last 7 days, hourly granularity
  - [ ] Transfer count metrics
    - [ ] Global cumulative count
    - [ ] Last 7 days, hourly granularity
  - [ ] DEX
    - [ ] OHLC tracking per token (hourly granularity)
    - [ ] Volume tracking (hourly granularity)
- Frontend
