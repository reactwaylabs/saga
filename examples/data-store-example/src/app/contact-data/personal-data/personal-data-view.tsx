import * as React from "react";

interface Props {
    firstName: string;
    lastName: string;
    contactNumber: string;
}

export class PersonalDataView extends React.PureComponent<Props, {}> {
    render() {
        return <div>
            <div>
                <div>
                    <h3>First name:</h3>
                </div>
                <div>
                    {this.props.firstName}
                </div>
            </div>
            <div>
                <div>
                    <h3>Last name:</h3>
                </div>
                <div>
                    {this.props.lastName}
                </div>
            </div>
            <div>
                <div>
                    <h3>Contact number:</h3>
                </div>
                <div>
                    {this.props.contactNumber}
                </div>
            </div>
        </div>;
    }
}
