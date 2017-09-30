import React, { PureComponent } from 'react';
import moment from 'moment';
import { List, Card, Row, Col, Radio, Input, Progress, Button, Icon, Dropdown, Menu, Avatar } from 'antd@next';

import styles from './BasicList.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;

function fakeList(count) {
  const titles = [
    '凤蝶',
    'AntDesignPro',
    'DesignLab',
    'Basement',
    'AntDesign',
    '云雀',
    '体验云',
    'AntDesignMobile',
  ];
  const avatars = [
    'https://gw.alipayobjects.com/zos/rmsportal/hYjIZrUoBfNxOAYBVDfc.png', // 凤蝶
    'https://gw.alipayobjects.com/zos/rmsportal/HHWPIzPLCLYmVuPivyiA.png', // 云雀
    'https://gw.alipayobjects.com/zos/rmsportal/irqByKtOdKfDojxIWTXF.png', // Basement
    'https://gw.alipayobjects.com/zos/rmsportal/VcmdbCBcwPTGYgbYeMzX.png', // DesignLab
  ];
  const covers = [
    'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
    'https://gw.alipayobjects.com/zos/rmsportal/xMPpMvGSIXusgtgUPAdw.png',
    'https://gw.alipayobjects.com/zos/rmsportal/hQReiajgtqzIVFjLXjHp.png',
    'https://gw.alipayobjects.com/zos/rmsportal/nczfTaXEzhSpvgZZjBev.png',
  ];

  const list = [];
  for (let i = 0; i < count; i += 1) {
    list.push({
      id: `fake-list-${i}`,
      owner: '曲丽丽',
      title: titles[i % 8],
      avatar: avatars[i % 4],
      cover: covers[i % 4],
      status: ['active', 'exception', 'normal'][i % 3],
      percent: Math.ceil(Math.random() * 50) + 50,
      logo: ['https://gw.alipayobjects.com/zos/rmsportal/KoJjkdbuTFxzJmmjuDVR.png', 'https://gw.alipayobjects.com/zos/rmsportal/UxGORCvEXJEsxOfEKZiA.png'][i % 2],
      href: 'https://ant.design',
      updatedAt: new Date(new Date().getTime() - (1000 * 60 * 60 * 2 * i)),
      createdAt: new Date(new Date().getTime() - (1000 * 60 * 60 * 2 * i)),
      subDescription: '一句话描述一句话描述',
      description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件，这些类似的组件会被抽离成一套标准规范。',
      activeUser: Math.ceil(Math.random() * 100000) + 100000,
      newUser: Math.ceil(Math.random() * 1000) + 1000,
      star: Math.ceil(Math.random() * 100) + 100,
      like: Math.ceil(Math.random() * 100) + 100,
      message: Math.ceil(Math.random() * 10) + 10,
      content: '段落示意：蚂蚁金服设计平台 design.alipay.com，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。蚂蚁金服设计平台 design.alipay.com，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。',
      members: [
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WPOxPBHGyqsgKPsFtVlJ.png',
          name: '王昭君',
        },
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WPOxPBHGyqsgKPsFtVlJ.png',
          name: '王昭君',
        },
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WPOxPBHGyqsgKPsFtVlJ.png',
          name: '王昭君',
        },
        {
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WPOxPBHGyqsgKPsFtVlJ.png',
          name: '王昭君',
        },
      ],
    });
  }

  return list;
}

class BasicList extends PureComponent {
  static defaultProps = {
    list: {
      list: fakeList(10),
      loading: false,
    }
  }
  render() {
    const { list: { list, loading } } = this.props;

    const extraContent = (
      <div className={styles.extraContent}>
        <RadioGroup defaultValue="all">
          <RadioButton value="all">全部</RadioButton>
          <RadioButton value="progress">进行中</RadioButton>
          <RadioButton value="waiting">等待中</RadioButton>
        </RadioGroup>
        <Search
          className={styles.extraContentSearch}
          placeholder="请输入"
          onSearch={() => ({})}
        />
      </div>
    );

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: 5,
      total: 50,
    };

    const ListContent = ({ data: { owner, createdAt, percent, status } }) => (
      <div className={styles.listContent}>
        <div>
          <span>Owner</span>
          <p>{owner}</p>
        </div>
        <div>
          <span>开始时间</span>
          <p>{moment(createdAt).format('YYYY-MM-DD hh:mm')}</p>
        </div>
        <div>
          <Progress percent={percent} status={status} strokeWidth={6} />
        </div>
      </div>
    );

    const menu = (
      <Menu>
        <Menu.Item>
          <a>编辑</a>
        </Menu.Item>
        <Menu.Item>
          <a>删除</a>
        </Menu.Item>
      </Menu>
    );

    const MoreBtn = () => (
      <Dropdown overlay={menu}>
        <a>
          更多 <Icon type="down" />
        </a>
      </Dropdown>
    );

    return (
      <div className={styles.standardList}>
        <Card
          bordered={false}
          title="基础列表"
          style={{ marginTop: 16 }}
          extra={extraContent}
        >
          <Button type="dashed" style={{ width: '100%' }}>
            <Icon type="plus" /> 添加
          </Button>
          <List
            rowKey="id"
            loading={loading}
            pagination={paginationProps}
            dataSource={list}
            renderItem={item => (
                <List.Item
                  actions={[<a>编辑</a>, <MoreBtn />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.logo} shape="square" size="large" />}
                    title={<a href={item.href}>{item.title}</a>}
                    description={item.subDescription}
                  />
                  <ListContent data={item} />
                </List.Item>
              )}
          />
        </Card>
      </div>
    );
  }
}

export default BasicList;
