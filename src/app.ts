// Imports
import xlsx from 'node-xlsx';
import * as co from 'co';
import * as mongo from 'mongodb';
import * as path from 'path';
import * as schedule from 'node-schedule';

// Imports models
import { Item } from './models/item';
import { ProcessedRow } from './models/processed-row';

// Import configurations
let config = require('./config').config;

const argv = require('yargs').argv;

if (argv.prod) {
    config = require('./config.prod').config;
}

schedule.scheduleJob('42 * * * *', () => {
    process();
});


function process() {
    co(function* () {

        const filename: string = path.join(config.priceListDir, 'FrontosaPrice_2017-06-06.xls');

        const workSheetsFromFile = xlsx.parse(filename);

        const processedRows: ProcessedRow[] = [];
        let currentHeaderColumns: string[] = null;

        for (const sheet of workSheetsFromFile.filter((x) => ['Main', 'consumable', 'NoteBook', 'mobile', 'Full PC', 'consumer'].indexOf(x.name) > -1)) {
            for (const row of sheet.data) {
                if (!isRowValid(row)) {
                    continue;
                }

                if (isRowHeader(row)) {
                    currentHeaderColumns = row;
                }

                if (isRowItem(row)) {
                    processedRows.push(new ProcessedRow(currentHeaderColumns, row, sheet.name));
                }
            }
        }

        const items = processedRows.map((x) => Item.fromProcessedRow(x));
        const filteredItems: Item[] = [];
        for (const item of items) {
            if (filteredItems.find((x) => x.code == item.code) === undefined) {
                filteredItems.push(item);
            }
        }

        const db: mongo.Db = yield mongo.MongoClient.connect('mongodb://localhost:27017/frontosa');

        const collection: mongo.Collection = db.collection('items');

        // yield collection.remove({});

        for (const item of filteredItems) {
            const databaseItem = yield collection.findOne({
                hash: item.hash
            });

            if (databaseItem) {
                continue;
            }

            console.log(`Inserting ${item.code}`);
            yield collection.insertOne({
                code: item.code,
                hash: item.hash,
                attributes: item.attributes,
                description: item.attributes,
                price: item.price
            });
        }

        db.close();
    });

}

function isRowValid(row): boolean {

    if (row.length === 0) {
        return false;
    }

    if (row[0] === undefined) {
        return false;
    }
    return true;
}

function isRowItem(row): boolean {
    const pattern = new RegExp(/([A-Z]{2})-(.*){3,13}/);

    if (pattern.test(row[0])) {
        return true;
    }

    return false;
}

function isRowHeader(row): boolean {
    const pattern = new RegExp(/([A-Z]{2})-(.*){3,13}/);

    if (pattern.test(row[0])) {
        return false;
    }

    return true;
}
