import * as React from "react";

interface Props {
    houseNumber: string;
    street: string;
    city: string;
    country: string;
    postCode: string;
}

export class AddressView extends React.PureComponent<Props, {}> {
    render() {
        return <div>
            <div>
                <h3>House number, street</h3>
                {`${this.props.houseNumber} ${this.props.street}`}
            </div>
            <div>
                <h3>City, country</h3>
                {`${this.props.city} ${this.props.country}`}
            </div>
            <div>
                <h3>Post code</h3>
                {this.props.postCode}
            </div>
        </div>;
    }
}
