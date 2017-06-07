export class Category {
    constructor(
        public code: string,
        public name: string,
        public count: number,
        public subCategories: Category[]) {

    }
}