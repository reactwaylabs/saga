import { DataStore } from "simplr-flux";
import { Abstractions } from "simplr-flux";

import * as path from "path";

export interface Address {
    HouseNumber: string;
    City: string;
    Country: string;
    PostCode: string;
    Street: string;
}

export interface PersonalData {
    Name: string;
    LastName: string;
    PhoneNumber: string;
}

const JSONS_FOLDER_NAME = "assets";
const ADDRESS_KEY = "address";
const PERSONAL_DATA_KEY = "personal-data";

class ContactDataStoreClass extends DataStore {

    private constructPath(fileName: string) {
        return path.join(__dirname, JSONS_FOLDER_NAME, fileName);
    }

    private getAddress = async () => {
        try {
            return await SystemJS.import(this.constructPath("address.json!"));
        } catch (error) {
            console.error(error);
        }
    }

    public GetAddress(noCache?: boolean): Abstractions.Item<Address> {
        return this.getValueFromState<Address>(ADDRESS_KEY, this.getAddress, noCache);
    }

    private getPersonalData = async () => {
        try {
            return await SystemJS.import(this.constructPath("personal-data.json!"));
        } catch (error) {
            console.error(error);
        }
    }

    public get PersonalData(): Abstractions.Item<PersonalData> {
        return this.getValueFromState<PersonalData>(PERSONAL_DATA_KEY, this.getPersonalData);
    }

    public InvalidatePersonalData() {
        this.invalidateCache(PERSONAL_DATA_KEY);
    }
}

export const ContactDataStore = new ContactDataStoreClass();
