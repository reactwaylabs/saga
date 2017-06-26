import * as React from "react";
import { Container } from "flux/utils";
import { ContactDataStore, Address } from "../contact-data-store";
import { Abstractions } from "simplr-flux";
import { AddressView } from "./address-view";

interface State {
    Address: Abstractions.Item<Address>;
}

export class AddressContainerClass extends React.Component<{}, State> {
    static getStores() {
        return [ContactDataStore];
    }

    static calculateState(state: State): State {
        return {
            Address: ContactDataStore.GetAddress()
        };
    }

    render() {
        switch (this.state.Address.Status) {
            case Abstractions.ItemStatus.Init: return <div>Address loading initialized.</div>;
            default:
            case Abstractions.ItemStatus.Pending: return <div>Address loading pending.</div>;
            case Abstractions.ItemStatus.Loaded: {
                return <AddressView
                    houseNumber={this.state.Address.Value!.HouseNumber}
                    street={this.state.Address.Value!.Street}
                    country={this.state.Address.Value!.Country}
                    city={this.state.Address.Value!.City}
                    postCode={this.state.Address.Value!.PostCode}
                />;
            }
            case Abstractions.ItemStatus.NoData: return <div>Address post found.</div>;
            case Abstractions.ItemStatus.Failed: return <div>Address to load post.</div>;
        }
    }
}

export const AddressContainer = Container.create(AddressContainerClass);
