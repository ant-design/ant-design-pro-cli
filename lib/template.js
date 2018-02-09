var model = function (props) {
  return `// import { xxx } from '../services/xxx';
export default {
  namespace: '${props.name}',
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

var service = function () {
  return `import { stringify } from 'qs';
import request from '../utils/request';

export async function getExample(params) {
  return request(\`/api/get?\${stringify(params)}\`);
}

export async function postExample(params) {
  return request('/api/post', {
    method: 'POST',
    body: params,
  });
}

`;
};

module.exports = {
  model: model,
  service: service,
};
