import { useSelector as useRedux, shallowEqual, useDispatch } from 'react-redux'
import _isEqual from 'lodash.isequal';

const useSelector = (selector: any) => useRedux(selector, shallowEqual);
const useDeepSelector = (selector: any) => useRedux(selector, _isEqual);
export { useDispatch, useSelector , useDeepSelector };