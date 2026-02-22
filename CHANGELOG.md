# Changelog

All notable changes to the TaaS SDK will be documented in this file.

## [4.0.0] - 2026-02-22

### Added
- **Truth Builder**: Implemented the protocol-compliant `Truth.fetch()` method for requesting data through decentralized gateway enclaves.
- **Build System**: Switched to `pnpm` and added `tsc` build scripts for workspace integrity.

### Changed
- **Architecture**: Synchronized with TaaS Core 3.0.1 "Mathematical Singularity" execution standards.
- **Interpolation**: Refined node reference objects for cleaner string interpolation in recipe handlers.

### Removed
- **Legacy AI**: Purged the `AI` builder and `reasoner` node generation as these services are now mandated to be enclosed in Secure Gateways.
- **Legacy Search**: Purged the `Search` builder and `search` node generation to prevent unverified data leakage.

## [1.0.0] - 2026-02-19

### Added
- **Initial Release**: Basic SDK structure for interacting with TaaS Protocol.
- **Types**: Exported core `Recipe` and `Attestation` types for third-party developers.
- **Privacy**: Configured package for public distribution (`private: true` removed for simulation).
