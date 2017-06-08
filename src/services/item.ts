// Imports
import * as co from 'co';
import * as mongo from 'mongodb';

// Imports models
import { Category } from './../models/category';
import { Item } from './../models/item';

export class ItemService {

    constructor(private uri: string) {

    }

    public listCategories(): Promise<Category> {
        const self = this;
        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('items');

            const data: any[] = yield collection.aggregate([
                {
                    $group: {
                        _id: { categoryCode: '$categoryCode', categoryName: '$categoryName', subCategoryName: '$subCategoryName' },
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            db.close();

            const categories: Category[] = data.map((x) => new Category(x._id.categoryCode, x._id.categoryName, x.count, [new Category(null, x._id.subCategoryName, x.count, null)]))

            const rolledUpCategories: Category[] = [];

            categories.forEach((x) => {
                const category: Category = rolledUpCategories.find((y) => y.code === x.code);

                if (!category) {
                    rolledUpCategories.push(x);
                } else {
                    category.subCategories = category.subCategories.concat(x.subCategories);

                    category.count = 0;

                    category.subCategories.forEach((x) => {
                        category.count += x.count;
                    });
                }
            });

            return rolledUpCategories;
        });
    }

    public listItems(categoryCode: string, subCategoryName: string, query: string, sortPropertyName: string, start: number, length: number): Promise<Item[]> {
        const self = this;
        return co(function* () {

            const db: mongo.Db = yield mongo.MongoClient.connect(self.uri);

            const collection: mongo.Collection = db.collection('items');

            const findQuery: {} = {};

            const sortQuery: {} = {};
            sortQuery[sortPropertyName] = -1;

            const items: Item[] = yield collection.find(findQuery).sort(sortQuery).skip(start).limit(length).toArray();

            db.close();

            return items;
        });
    }
}