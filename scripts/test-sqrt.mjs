import { ethers } from "ethers";

function sqrt(y) {
    if (y > 3) {
        let z = y;
        let x = Math.floor(y / 2) + 1;
        while (x < z) {
            z = x;
            x = Math.floor((Math.floor(y / x) + x) / 2);
        }
        return z;
    } else if (y != 0) {
        return 1;
    }
    return 0;
}

console.log("sqrt(1000 * 1000) =", sqrt(1000 * 1000));
console.log("Expected: 1000");
