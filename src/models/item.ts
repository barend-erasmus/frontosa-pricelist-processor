// Imports
import * as hash from 'object-hash';

// Imports models
import { ProcessedRow } from './processed-row';

export class Item {

    public static fromProcessedRow(row: ProcessedRow) {
        const attributes = {};

        for (let i = 0; i < row.header.length; i++) {
            if (i <= 3) {
                continue;
            }

            if (row.header[i]) {
                const name = row.header[i].toString().replace(/\./g, '-');
                attributes[name] = row.row[i];
            }
        }

        const subCategoryName: string = row.header[0];
        const code: string = row.row[0];
        const description: string = row.row[3];
        const price: number = parseFloat(row.row[1]);
        const categoryCode: string = code.split('-')[0];
        const categoryName: string = null;
        const h: string = hash(row);

        return new Item(code, description, price, attributes, categoryCode, categoryName, subCategoryName, h);
    }

    constructor(
        public code: string,
        public description: string,
        public price: number,
        public attributes: {},
        public categoryCode: string,
        public categoryName: string,
        public subCategoryName: string,
        public hash: string) {

            if (!this.categoryName) {
                this.categoryName = this.categoryCodeToCategoryName(this.categoryCode);
            }

    }

    private categoryCodeToCategoryName(categoryCode: string): string {
        const map: any = {
            "SY": 'My Office & Black Box',
            "BS": 'Bundle Special',
            "CP": 'Central Processing Unit (CPU)',
            "CC": 'CPU Coolers',
            "MC": 'Memory Coolers',
            "ME": 'Memory',
            "CA": 'Cables',
            "MP": 'Media Players',
            "FD": 'Flash Drives',
            "Co": 'Converters',
            "CR": 'Card Readers',
            "SD": 'SD Cards / Micro SD Cards',
            "MS": 'Memory Sticks',
            "CF": 'Compact Flashes',
            "MB": 'Motherboards',
            "CH": 'Chassis',
            "SC": 'Graphics Cards',
            "HU": 'Hubs',
            "DS": 'Docking Stations',
            "VS": 'Video Switches',
            "RE": 'Remote Controls',
            "VR": 'Video Recorders',
            "TT": 'TV Tuners',
            "LS": 'LCD Stands',
            "NB": 'Notebooks',
            "LC": 'Monitors / TV\'s',
            "AC": 'Add-on Card Storage',
            "HD": 'Hard Drives',
            "EE": 'External Enclosures',
            "MR": 'Mobile Racks',
            "CB": 'Carry Bags',
            "EH": 'External Hard Drives',
            "DW": 'DVD Writers',
            "BW": 'Blu Ray Writers',
            "BP": 'Blu Ray Players',
            "PS": 'Power Supplies',
            "FA": 'Fans',
            "HC": 'Hard Drive Cages',
            "WC": 'Web Cams',
            "VC": 'VGA Coolers',
            "DU": 'Duplicators',
            "LT": 'Lighting',
            "SF": 'Software',
            "KM": 'Keyboard & Mouse Combo\'s',
            "KE": 'Keyboards',
            "PR": 'Peripherals',
            "Mo": 'Mouse',
            "MO": 'Mouse',
            "GC": 'Gaming Chairs',
            "GA": 'Game Devices',
            "GM": 'Gaming Gear',
            "SP": 'Speakers',
            "AA": 'Add-on Audio',
            "NA": 'Network Adapters',
            "NE": 'Network Splitters',
            "HS": 'Headsets',
            "PP": 'Multimedia Accessories',
            "MD": 'Modems / Routers',
            "SW": 'Switches',
            "DP": 'Dotmatrix Printers',
            "IP": 'InkJet Printers',
            "LP": 'Lazer Printers',
            "FX": 'Fax Machines',
            "SN": 'Scanners',
            "KS": 'KVM Switches',
            "UP": 'UPS',
            "RB": 'INK - Ribbon',
            "CT": 'Cartridges',
            "3P": '3D Printer Filaments',
            "PA": 'Paper',
            "WA": 'Warranties',
            "TA": 'Tablets',
            "CK": 'Notebook Accessories',
            "NC": 'Notebook Coolers / Stands',
            "BT": 'Power Banks',
            "PC": 'Screen Protectors',
            "LL": 'LED Lamps',
            "PJ": 'Projectors',
            "DV": 'Digital Video Cameras',
            "DC": 'Digital Cameras'
        };

        return map[categoryCode];
    }

}