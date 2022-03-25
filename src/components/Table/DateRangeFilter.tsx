import React from 'react';
import {
  ClickAwayListener,
  IconButton,
  Paper,
  Popper,
  TextField,
} from '@material-ui/core';
import moment from 'moment';
import 'moment/locale/fr';
import { DateRange as DateRangeIcon } from '@material-ui/icons';
import SlideTransition from '../Transitions/SlideTransition';
import { DateRangePicker } from 'react-date-range';
import { fr } from 'date-fns/locale';

moment.locale('fr');

interface DateRangeFilterProps {
  value: { startDate: Date; endDate: Date };
  onChange: (value: { startDate: Date; endDate: Date }) => void;
}

interface DateRangeFilterState {
  anchorEl: HTMLButtonElement | null;
}

export default class DateRangeFilter extends React.Component<
  DateRangeFilterProps,
  DateRangeFilterState
> {
  constructor(props: DateRangeFilterProps) {
    super(props);

    this.state = {
      anchorEl: null,
    };

    this.isSelected = this.isSelected.bind(this);
  }

  formatValue(): string {
    return `De ${moment(this.props.value.startDate).format(
      'DD-MM-YYYY',
    )} à ${moment(this.props.value.endDate).format('DD-MM-YYYY')}`;
  }

  isSelected(range: { startDate?: Date; endDate?: Date }): boolean {
    return (
      moment(this.props.value.startDate).diff(
        moment(range.startDate),
        'days',
      ) >= 0 &&
      moment(this.props.value.endDate).diff(moment(range.endDate), 'days') <= 0
    );
  }

  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          disabled
          value={this.formatValue()}
          style={{ width: 220 }}
        />
        <IconButton
          style={{ marginLeft: 6 }}
          onClick={(e) => {
            if (this.state.anchorEl) this.setState({ anchorEl: null });
            else this.setState({ anchorEl: e.currentTarget });
          }}
        >
          <DateRangeIcon />
        </IconButton>
        <Popper
          style={{ zIndex: 1200 }}
          open={!!this.state.anchorEl}
          anchorEl={this.state.anchorEl}
          placement="bottom"
          transition
        >
          {({ TransitionProps }) => (
            <SlideTransition {...TransitionProps}>
              <Paper>
                <ClickAwayListener
                  onClickAway={() => this.setState({ anchorEl: null })}
                >
                  <DateRangePicker
                    locale={fr}
                    onChange={(item) => {
                      this.props.onChange(
                        (item as { range1: { startDate: Date; endDate: Date } })
                          .range1,
                      );
                    }}
                    editableDateInputs
                    showSelectionPreview={true}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    inputRanges={[]}
                    staticRanges={[]}
                    ranges={[this.props.value]}
                    direction="horizontal"
                  />
                </ClickAwayListener>
              </Paper>
            </SlideTransition>
          )}
        </Popper>
      </div>
    );
  }
}
