import { CancelToken } from 'axios';
import Food from '../models/Food.model';
import Menu from '../models/Menu.model';
import Restaurant from '../models/Restaurant.model';
import Api from '../Api';
import querystring from 'querystring';
import { Lang } from '../types/Lang';

export type SearchResult =
  | {
      type: 'food';
      content: Food;
    }
  | {
      type: 'restaurant';
      content: Restaurant;
    }
  | {
      type: 'menu';
      content: Menu;
    };

const search: (params: {
  lang: Lang;
  query: string;
  type?: string;
  filter?: { [key: string]: any };
  cancelToken?: CancelToken;
  location?: { type?: string; coordinates: [number, number] };
  range?: number;
  searchCategory?: string;
}) => Promise<SearchResult[]> = async ({
  lang,
  query,
  filter = {},
  type = 'all',
  cancelToken,
  range = 2,
  searchCategory,
  location,
}) => {
  try {
    const queryString = querystring.stringify({
      q: query,
      lang,
      type,
      filter: JSON.stringify({ ...filter, searchCategory }),
    });

    const restaurantSpecificQuery =
      type === 'restaurant' && searchCategory === 'nearest' && location
        ? querystring.stringify({ range, location: JSON.stringify(location) })
        : undefined;

    const res = await Api.get(
      `/search?${queryString}${
        restaurantSpecificQuery ? '&' + restaurantSpecificQuery : ''
      }`,
      {
        method: 'GET',
        cancelToken,
      },
    );
    if (res.status === 200) {
      return (res.data as SearchResult[]).filter(
        (result) =>
          (result.type === 'restaurant' &&
            result.content.referencement &&
            result.content.status) ||
          (result.type === 'food' &&
            result.content.restaurant?.referencement &&
            result.content.restaurant?.status) ||
          (result.type === 'menu' &&
            result.content.restaurant?.referencement &&
            result.content.restaurant?.status),
      );
    } else {
      const error = {
        status: res.status,
        message: 'Erreur',
      };
      return Promise.reject(error);
    }
  } catch (e) {
    return Promise.reject(e);
  }
};

export default search;
