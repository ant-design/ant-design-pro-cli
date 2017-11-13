import dva from 'dva';
import 'moment/locale/zh-cn';
import models from './models';
import './polyfill';

import 'antd/dist/antd.min.css';
import './index.less';

// 1. Initialize
const app = dva({
});

// 2. Plugins
// app.use({});

// 3. Model move to router
models.forEach((m) => {
  app.model(m);
});

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
