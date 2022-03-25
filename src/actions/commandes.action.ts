import { createAction } from 'redux-actions';

import { COMMANDS } from '../constants/actions';
import Command from '../models/Command.model';
import { getCommands } from '../services/commands';

const load = createAction(COMMANDS.LOAD);

export const getAllCommands = (restoId: any) => async (dispatch: any) => {
    const delivery = await getCommands('delivery', { restaurant: restoId });
    const takeaway = await getCommands('takeaway', { restaurant: restoId });
    const onSite = await getCommands('on_site', { restaurant: restoId });

    let restoOptions: any[] = [];
    ([...delivery, ...takeaway, ...onSite] || []).forEach((command: Command) => {
        if (restoOptions.findIndex(x => x.label === command.restaurant.name) === -1) {
            restoOptions.push({
                label: command.restaurant.name,
                value: command.restaurant.name,
                id: command.restaurant._id,
            });
        }
    })

    await dispatch(load({ delivery, takeaway, onSite, isLoaded: true, restoOptions }));
}