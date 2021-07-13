module.exports = [
  // user
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', layout: false, name: 'login', component: './user/Login' },
      {
        path: '/user/register',
        name: 'register',
        layout: false,
        component: './User/Register',
      },
      {
        path: '/user/register-result',
        name: 'register.result',
        layout: false,
        component: './User/RegisterResult',
      },
      { path: '/user', redirect: '/user/login' },
      {
        component: '404',
      },
    ],
  },
  // dashboard
  {
    path: '/dashboard',
    name: 'dashboard',
    icon: 'dashboard',
    routes: [
      {
        path: '/dashboard/analysis',
        name: 'analysis',
        component: './Dashboard/Analysis',
      },
      {
        path: '/dashboard/monitor',
        name: 'monitor',
        component: './Dashboard/Monitor',
      },
      {
        path: '/dashboard/workplace',
        name: 'workplace',
        component: './Dashboard/Workplace',
      },
      { path: '/dashboard', redirect: '/dashboard/analysis' },
    ],
  },
  // forms
  {
    path: '/form',
    icon: 'form',
    name: 'form',
    routes: [
      {
        path: '/form/basic-form',
        name: 'basicform',
        component: './Form/BasicForm',
      },
      {
        path: '/form/step-form',
        name: 'stepform',
        component: './Form/StepForm',
      },
      {
        path: '/form/advanced-form',
        name: 'advancedform',
        component: './Form/AdvancedForm',
      },
      { path: '/form', redirect: '/form/basic-form' },
    ],
  },
  // list
  {
    path: '/list',
    icon: 'table',
    name: 'list',
    routes: [
      {
        path: '/list/table-list',
        name: 'searchtable',
        component: './list/Tablelist',
      },
      {
        path: '/list/basic-list',
        name: 'basiclist',
        component: './list/Basiclist',
      },
      {
        path: '/list/card-list',
        name: 'cardlist',
        component: './list/Cardlist',
      },
      {
        path: '/list/search',
        name: 'search-list',
        component: './list/search',
        routes: [
          {
            path: '/list/search/articles',
            name: 'articles',
            component: './list/Articles',
          },
          {
            path: '/list/search/projects',
            name: 'projects',
            component: './list/Projects',
          },
          {
            path: '/list/search/applications',
            name: 'applications',
            component: './list/Applications',
          },
          {
            path: '/list/search',
            redirect: '/list/search/articles',
          },
        ],
      },
      { path: '/list', redirect: '/list/table-list' },
    ],
  },
  {
    path: '/profile',
    name: 'profile',
    icon: 'profile',
    routes: [
      // profile
      {
        path: '/profile/basic',
        name: 'basic',
        component: './Profile/BasicProfile',
      },
      {
        path: '/profile/basic/:id',
        hideInMenu: true,
        component: './Profile/BasicProfile',
      },
      {
        path: '/profile/advanced',
        name: 'advanced',
        component: './Profile/AdvancedProfile',
      },
      { path: '/profile', redirect: '/profile/basic' },
    ],
  },
  {
    name: 'result',
    icon: 'CheckCircleOutlined',
    path: '/result',
    routes: [
      // result
      {
        path: '/result/success',
        name: 'success',
        component: './Result/Success',
      },
      {
        path: '/result/fail',
        name: 'fail',
        component: './Result/Error',
      },
      { path: '/result', redirect: '/result/success' },
    ],
  },
  {
    name: 'exception',
    icon: 'warning',
    path: '/exception',
    routes: [
      // exception
      {
        path: '/exception/403',
        name: 'not-permission',
        component: './Exception/403',
      },
      {
        path: '/exception/404',
        name: 'not-find',
        component: './Exception/404',
      },
      {
        path: '/exception/500',
        name: 'server-error',
        component: './Exception/500',
      },
      { path: '/exception', redirect: '/exception/403' },
    ],
  },
  {
    name: 'account',
    icon: 'user',
    path: '/account',
    routes: [
      {
        path: '/account/center',
        name: 'center',
        component: './Account/Center/Center',
      },
      {
        path: '/account/settings',
        name: 'settings',
        component: './Account/Settings/Info',
      },
      { path: '/account', redirect: '/account/center' },
    ],
  },
  //  editor
  {
    name: 'editor',
    icon: 'highlight',
    path: '/editor',
    routes: [
      {
        path: '/editor/flow',
        name: 'flow',
        component: './Editor/GGEditor/Flow',
      },
      {
        path: '/editor/mind',
        name: 'mind',
        component: './Editor/GGEditor/Mind',
      },
      {
        path: '/editor/koni',
        name: 'koni',
        component: './Editor/GGEditor/Koni',
      },
      { path: '/editor', redirect: '/editor/flow' },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/analysis',
  },
  {
    component: '404',
  },
];
