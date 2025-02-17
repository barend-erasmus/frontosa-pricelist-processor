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

if (argv.prod) {
    schedule.scheduleJob('30 * * * *', () => {
        console.log('Processing');
        process();
    });
} else {
    process();
}

console.log(argv);

function process() {
    co(function* () {

        const filename: string = path.join(__dirname, 'price-lists', 'FrontosaPrice_2017-07-18.xls');

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

        console.log(`${filteredItems.length}`);

        const db: mongo.Db = yield mongo.MongoClient.connect('mongodb://207.154.251.91:27017/frontosa-ui');

        const collection: mongo.Collection = db.collection('items');

        yield collection.remove({});

        for (const item of filteredItems) {
            const databaseItem = yield collection.findOne({
                hash: item.hash
            });

            if (databaseItem) {
                continue;
            }

            console.log(`Inserting ${item.code}`);
            yield collection.insertOne({
                name: item.name,
                code: item.code,
                hash: item.hash,
                attributes: item.attributes,
                description: item.description,
                price: item.price,
                categoryCode: item.categoryCode,
                categoryName: item.categoryName
            });
        }

        yield collection.dropIndexes();

        yield collection.createIndex({
            name: 'text',
            description: 'text',
            code: 'text'
        });

        db.close();
    }).catch((err: Error) => {
        console.log(err.message);
        console.log(err.stack);
    })

}

function isRowValid(row): boolean {

    if (row.length === 0) {
        return false;
    }

    if (row[0] === undefined) {
        return false;
    }

    if (row[3] === undefined) {
        return false;
    }

    return true;
}

function isRowItem(row): boolean {
    const pattern = new RegExp(/^(([A-Z|a-z]){2})-([^ ]*){3,13}$/);

    if (pattern.test(row[0])) {
        return true;
    }

    return false;
}

function isRowHeader(row): boolean {
    const pattern = new RegExp(/^(([A-Z|a-z]){2})-([^ ]*){3,13}$/);

    if (pattern.test(row[0])) {
        return false;
    }

    return true;
}
