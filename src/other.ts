// Imports
import * as co from 'co';
import * as mongo from 'mongodb';
import * as fs from 'fs';

// Imports models
import { Category } from './models/category';

co(function* () {

    const db: mongo.Db = yield mongo.MongoClient.connect('mongodb://localhost:27017/frontosa');

    const collection: mongo.Collection = db.collection('items');

    const data: any[] = yield collection.aggregate([
        {
            $group: {
                _id: { categoryCode: '$categoryCode', categoryName: '$categoryName', subCategoryName: '$subCategoryName' },
                count: { $sum: 1 }
            }
        }
    ]).toArray();

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

    console.log(rolledUpCategories[10]);

    db.close();
});



