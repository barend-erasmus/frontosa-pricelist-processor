// Imports
import * as hash from 'object-hash';

// Imports models
import { ProcessedRow } from './processed-row';

export class Item {

    public static fromProcessedRow(row: ProcessedRow) {
        const attributes = {};

        for (let i = 0; i < row.header.length; i ++) {
            if (i <= 3) {
                continue;
            }

            if (row.header[i]) {
                const name = row.header[i].toString().replace(/\./g, '-');
                attributes[name] = row.row[i];
            }
        }

        return new Item(row.row[0], row.row[3], parseFloat(row.row[1]), attributes, hash(row));
    }

    constructor(public code: string, public description: string, public price: number, public attributes: {}, public hash: string) {

    }
    
}