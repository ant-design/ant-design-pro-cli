// import { xxx } from '../services/xxx';
export default {
  namespace: "config",
  state: {
    id: 'root',
    name: 'div',
    props: {},
    children: [],
  },
  effects: {
    *fetch({ payload }, { call, put }) {
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
      };
    },
  },
};

