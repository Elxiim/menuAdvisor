import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import PlacesAutocomplete, { Suggestion } from 'react-places-autocomplete';

export default class AddressInput extends React.Component<
  {
    error?: boolean;
    helperText?: string;
    onChange?: (place: Suggestion) => void;
    defaultValue?: string;
  },
  { address: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { address: this.props.defaultValue || '' };
  }

  handleChange = (address: string) => {
    this.setState({ address });
  };

  render() {
    return (
      <PlacesAutocomplete
        value={this.state.address}
        onChange={this.handleChange}
      >
        {({ getInputProps, suggestions, loading }) => (
          <Autocomplete
            noOptionsText="Aucune adresse trouvée"
            options={suggestions.map((v) => v)}
            loading={loading}
            getOptionLabel={(option) => option.description}
            onChange={(_, value) => value && this.props.onChange?.(value)}
            inputValue={this.state.address || this.props.defaultValue}
            onInputChange={(_, value) =>
              getInputProps().onChange({ target: { value } })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                name="address"
                placeholder="Adresse"
                error={this.props.error}
                helperText={this.props.helperText}
                defaultValue={this.props.defaultValue}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        )}
      </PlacesAutocomplete>
    );
  }
}
