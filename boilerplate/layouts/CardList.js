import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { Card, Avatar, Button, Icon, List } from 'antd';

import styles from './CardList.less';

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

export default class CardList extends PureComponent {
  static defaultProps = {
    list: {
      list: fakeList(10),
      loading: false,
    }
  }
  render() {
    const { list: { list, loading } } = this.props;

    return (
      <div className={styles.cardList}>
        <List
          rowKey="id"
          loading={loading}
          grid={{ gutter: 16, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={['', ...list]}
          renderItem={item => (item ? (
              <List.Item key={item.id}>
                <Link to="/list/card-list">
                  <Card actions={[<a>操作一</a>, <a>操作二</a>]}>
                    <Card.Meta
                      avatar={<Avatar size="large" src={item.avatar} />}
                      title={item.title}
                      description={(
                        <p className={styles.cardDescription}>
                          <span>{item.description}</span>
                        </p>
                      )}
                    />
                  </Card>
                </Link>
              </List.Item>
              ) : (
                <List.Item>
                  <Button type="dashed" className={styles.newButton}>
                    <Icon type="plus" /> 新增产品
                  </Button>
                </List.Item>
              )
            )}
        />
      </div>
    );
  }
}
