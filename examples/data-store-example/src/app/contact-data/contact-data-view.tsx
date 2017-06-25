import * as React from "react";
import { PersonalDataContainer } from "./personal-data/personal-data-container";
import { AddressContainer } from "./address/address-container";

export class ContactDataView extends React.Component<{}, {}> {
    render() {
        return <div>
            <div>
                <h2>Personal data:</h2>
                <PersonalDataContainer />
            </div>
            <div>
                <h2>Address:</h2>
                <AddressContainer />
            </div>
        </div>;
    }
}
