import Command, {
  FoodInCommand,
  MenuInCommand,
  Option,
} from '../models/Command.model';

const estimateOptionPrice: (options: Option[]) => number = (options) =>
  options.reduce<number>(
    (p, { items }) =>
      p +
      items.reduce<number>(
        (p, { quantity, item: { price } }) =>
          p + quantity * (price?.amount || 0),
        0,
      ),
    0,
  );

export const estimateCommandPrice: (command: Command) => number = ({
  menus,
  items,
  commandType,
  restaurant,
}) =>
  menus.reduce((p, c) => p + estimateMenuPrice(c), 0) +
  items.reduce((p, c) => p + estimateFoodPrice(c), 0) +
  (commandType === 'delivery' ? restaurant.deliveryPrice.amount : 0);

export const estimateFoodPrice: (food: FoodInCommand) => number = ({
  item,
  quantity,
  options,
}) => ((item.price.amount || 0) + estimateOptionPrice(options)) * quantity;

export const estimateMenuPrice: (menu: MenuInCommand) => number = ({
  foods,
  quantity,
  item: {
    price: { amount },
    type,
    foods: foodsInMenu,
  },
}) =>
  type === 'priceless'
    ? 0
    : type === 'per_food'
    ? quantity *
      foods.reduce<number>(
        (
          p,
          {
            food: {
              price: { amount },
            },
            options,
          },
        ) => p + (amount || 0) + estimateOptionPrice(options),
        0,
      )
    : quantity *
      (amount +
        foods.reduce<number>(
          (p, { food: { _id }, options }) =>
            p +
            (foodsInMenu.find(({ food: f }) => f._id === _id)?.additionalPrice
              .amount || 0) +
            estimateOptionPrice(options),
          0,
        ));
