// The coins and chains a crypto giving window offers.

/** One address, and the chain it lives on. */
export interface CryptoNetwork {
  /** Stable id, for the copy toast and for the app's own tests. */
  id: string;
  /** The chain as a donor's wallet names it. */
  name: string;
  address: string;
  /** One short line shown with the address, for what a donor has to know
   *  before sending. Already translated. */
  note?: string;
}

/** One coin, and every chain it can be sent on. */
export interface CryptoCoin {
  /** Stable id, and the key a coin's mark is drawn by. */
  id: string;
  /** The ticker, on the tile under the mark. */
  symbol: string;
  /** The full name, for the accessible label. */
  name: string;
  /** Never empty, and every entry carries an address. */
  networks: CryptoNetwork[];
  /** The coin's own colour and the ink that holds on it, which its tile lights
   *  up in under the pointer ("Brand tiles"). The picked coin keeps the accent. */
  tile?: { color: string; ink: string };
}
