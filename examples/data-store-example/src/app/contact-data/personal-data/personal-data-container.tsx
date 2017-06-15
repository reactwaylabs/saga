import * as React from "react";
import { Container } from "flux/utils";
import { ContactDataStore, PersonalData } from "../contact-data-store";
import { Abstractions } from "simplr-flux";
import { PersonalDataView } from "./personal-data-view";

interface State {
    PersonalData: Abstractions.Item<PersonalData>;
}

class PersonalDataContainerClass extends React.Component<{}, State> {
    static getStores() {
        return [ContactDataStore];
    }

    static calculateState(state: State): State {
        return {
            PersonalData: ContactDataStore.PersonalData
        };
    }

    render(): JSX.Element {
        switch (this.state.PersonalData.Status) {
            case Abstractions.ItemStatus.Init: return <div>Personal data loading initialized.</div>;
            case Abstractions.ItemStatus.Pending: return <div>Personal data loading pending.</div>;
            case Abstractions.ItemStatus.Loaded: {
                return <PersonalDataView
                    firstName={this.state.PersonalData.Value!.Name}
                    lastName={this.state.PersonalData.Value!.LastName}
                    contactNumber={this.state.PersonalData.Value!.PhoneNumber}
                />;
            }
            case Abstractions.ItemStatus.NoData: return <div>No personal data found.</div>;
            case Abstractions.ItemStatus.Failed: return <div>Failed to load personal data.</div>;
        }
    }
}

export const PersonalDataContainer = Container.create(PersonalDataContainerClass);
