var model = function (props) {
  return `// import { xxx } from '../services/xxx';
export default {
  namespace: "${props.name}",
  state: {},
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

`;
};

module.exports = {
  model: model,
};
