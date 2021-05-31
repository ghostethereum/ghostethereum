import BN from "bignumber.js";

export function fromWei(amount: string | number, decimals = 18): string {
    const bn = new BN(amount || 0);
    const [int, dec] = bn.div(10 ** decimals).toFixed(2).split('.');

    if (dec) {
        return `${int.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}.${dec}`;
    }

    return int.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}