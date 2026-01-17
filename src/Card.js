import React from 'react';
import { Card as AntdCard, Image } from 'antd';
import PropTypes from 'prop-types';

function Card({ elem, onClick }) {
  const { cardType, text, sourceUrl, key } = elem;
  const cardId = `card-${key}`;
  const renderAudioCard = () => (
    <div
      id={cardId}
      style={{ border: '1px solid lightgrey', height: 'fit-content', borderRadius: '8px', cursor: 'pointer', padding: '0.4rem' }}
      onClick={onClick}
      >
      <AntdCard bordered={false}>
        <audio preload='none' src={sourceUrl} controls />
        {text !== '' ? <p>{text}</p> : null}
      </AntdCard>
    </div>
  );
  const renderTextCard = () => (
    <div
      id={cardId}
      style={{
        border: '1px solid lightgrey',
        height: 'fit-content',
        borderRadius: '8px',
        maxWidth: '250px',
        cursor: 'pointer',
        padding: '0.4rem'
      }}
      onClick={onClick}
      >
      <AntdCard style={{ boxShadow: 'none' }} bordered={false}>
        {text !== '' ? <div>{text}</div> : null}
      </AntdCard>
    </div>
  );
  const renderImageCard = () => (
    <div
      id={cardId}
      style={{ border: '1px solid lightgrey', height: 'fit-content', borderRadius: '8px', cursor: 'pointer', padding: '0.4rem' }}
      onClick={onClick}
      >
      <AntdCard bordered={false}>
        <Image width={200} src={sourceUrl} preview={false} />
        {text !== '' ? <p>{text}</p> : null}
      </AntdCard>
    </div>
  );

  const renderVideoCard = () => (
    <div
      id={cardId}
      style={{ border: '1px solid lightgrey', height: 'fit-content', borderRadius: '8px', cursor: 'pointer', padding: '0.4rem' }}
      onClick={onClick}
      >
      <AntdCard bordered={false}>
        <video width={200} preload='none' src={sourceUrl} controls />
        {text !== '' ? <p>{text}</p> : null}
      </AntdCard>
    </div>
  );

  return (
    <React.Fragment>
      {cardType === 'text' && renderTextCard()}
      {cardType === 'audio' && renderAudioCard()}
      {cardType === 'image' && renderImageCard()}
      {cardType === 'video' && renderVideoCard()}
    </React.Fragment>
  );
}

export default Card;

Card.propTypes = {
  elem: PropTypes.object.isRequired,
  onClick: PropTypes.func
};

Card.defaultProps = {
  onClick: () => {}
};
