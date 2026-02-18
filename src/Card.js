import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Popover } from 'antd';
import { ExpandOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Markdown from '@educandu/educandu/components/markdown.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import MediaPlayer from '@educandu/educandu/components/media-player/media-player.js';
import AbcNotation from '@educandu/educandu/components/abc-notation.js';
import AbcPlayer from '@educandu/educandu/components/abc-player.js';
import { MEDIA_SCREEN_MODE } from '@educandu/educandu/domain/constants.js';
import { getAccessibleUrl, isInternalSourceType } from '@educandu/educandu/utils/source-utils.js';

function Card({ elem, mediaNumber, onClick, isSelected }) {
  const { cardType, text, sourceUrl, key, abcCode, playMidi, type, label, copyrightNotice } = elem;
  const { t } = useTranslation('benewagner/educandu-plugin-music-mapping');
  const cardId = `card-${key}`;
  const clientConfig = useService(ClientConfig);
  const [abcRenderResult, setAbcRenderResult] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Convert CDN URLs to accessible URLs
  const accessibleUrl = getAccessibleUrl({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });
  const allowDownload = isInternalSourceType({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });

  const isQuestion = type === 'question';

  // Determine content description for ARIA label
  const getContentDescription = () => {
    if (text) {
      return text;
    }
    if (label) {
      return label;
    }
    if (cardType === 'audio' && mediaNumber) {
      return `Audio ${mediaNumber}`;
    }
    if (cardType === 'video' && mediaNumber) {
      return `Video ${mediaNumber}`;
    }
    if (cardType === 'abc' && abcCode) {
      return 'ABC Notation';
    }
    if (cardType === 'image') {
      return 'Image';
    }
    return '';
  };

  const contentDescription = getContentDescription();
  const getAriaLabelKey = () => {
    if (isQuestion) {
      return isSelected ? 'ariaQuestionCardSelected' : 'ariaQuestionCard';
    }
    return isSelected ? 'ariaAnswerCardSelected' : 'ariaAnswerCard';
  };
  const ariaLabel = t(getAriaLabelKey(), { content: contentDescription });

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: isQuestion ? 'row' : 'row-reverse',
    border: '1px solid lightgrey',
    cursor: 'pointer',
    width: '340px',
    boxSizing: 'border-box'
  };

  const cardClassName = `MusicMapping-card MusicMapping-card--${type}`;

  const ariaProps = {
    'role': 'button',
    'tabIndex': 0,
    'aria-label': ariaLabel,
    'aria-pressed': isSelected,
    'onKeyDown': handleKeyDown
  };

  const contentStyle = {
    flex: 1,
    padding: '0.8rem'
  };

  const stopPropagation = e => e.stopPropagation();

  const handleEnlargeClick = e => {
    e.stopPropagation();
    setPreviewVisible(true);
  };

  const renderEnlargeButton = () => (
    <button type="button" className="MusicMapping-card-enlargeBtn" onClick={handleEnlargeClick}>
      <ExpandOutlined />
    </button>
  );

  const renderInfoButton = () => {
    if (!copyrightNotice) {
      return null;
    }
    return (
      <Popover
        content={<div className="MusicMapping-card-copyrightPopover"><Markdown inline>{copyrightNotice}</Markdown></div>}
        trigger="click"
        >
        <button type="button" className="MusicMapping-card-infoBtn" onClick={stopPropagation}>
          <InfoCircleOutlined />
        </button>
      </Popover>
    );
  };

  const renderAudioCard = () => (
    <div id={cardId} className={cardClassName} style={cardStyle} onClick={onClick} {...ariaProps}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        <div className="MusicMapping-card-mediaWrapper">
          {!!mediaNumber && (
            <div className="MusicMapping-card-mediaPreview">
              Audio {mediaNumber}
            </div>
          )}
          {renderInfoButton()}
        </div>
        <div className="MusicMapping-card-controls" onClick={stopPropagation}>
          {!!accessibleUrl && (
            <MediaPlayer
              sourceUrl={accessibleUrl}
              screenMode={MEDIA_SCREEN_MODE.none}
              allowDownload={allowDownload}
              allowLoop={false}
              allowPlaybackRate={false}
              canDownload={allowDownload}
              />
          )}
        </div>
        {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
      </div>
      <div className="MusicMapping-clickArea" />
    </div>
  );

  const renderTextCard = () => (
    <div id={cardId} className={cardClassName} style={cardStyle} onClick={onClick} {...ariaProps}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        {text !== '' ? <div>{text}</div> : null}
      </div>
      <div className="MusicMapping-clickArea" />
    </div>
  );

  const renderImageCard = () => (
    <div id={cardId} className={cardClassName} style={cardStyle} onClick={onClick} {...ariaProps}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        <div className="MusicMapping-card-mediaWrapper">
          <img
            src={accessibleUrl}
            alt={text || ''}
            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          {renderEnlargeButton()}
          {renderInfoButton()}
        </div>
        {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
      </div>
      <div className="MusicMapping-clickArea" />
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width="auto"
        className="MusicMapping-previewModal"
        >
        <img
          src={accessibleUrl}
          alt={text || ''}
          className="MusicMapping-previewModal-image"
          />
      </Modal>
    </div>
  );

  const renderVideoCard = () => (
    <div id={cardId} className={`${cardClassName} MusicMapping-card--video`} style={cardStyle} onClick={onClick} {...ariaProps}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        <div className="MusicMapping-card-mediaWrapper" onClick={stopPropagation}>
          {!!accessibleUrl && !previewVisible && (
            <MediaPlayer
              sourceUrl={accessibleUrl}
              screenMode={MEDIA_SCREEN_MODE.video}
              allowDownload={allowDownload}
              allowLoop={false}
              allowPlaybackRate={false}
              allowFullscreen={false}
              canDownload={allowDownload}
              />
          )}
          {renderEnlargeButton()}
          {renderInfoButton()}
        </div>
        {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
      </div>
      <div className="MusicMapping-clickArea" />
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        destroyOnClose
        width="80vw"
        className="MusicMapping-previewModal MusicMapping-previewModal--video"
        >
        {!!accessibleUrl && !!previewVisible && (
          <MediaPlayer
            sourceUrl={accessibleUrl}
            screenMode={MEDIA_SCREEN_MODE.video}
            allowDownload={allowDownload}
            allowLoop={false}
            allowPlaybackRate={false}
            allowFullscreen
            canDownload={allowDownload}
            />
        )}
      </Modal>
    </div>
  );

  const renderAbcCard = () => (
    <div id={cardId} className={`${cardClassName} MusicMapping-card--abc`} style={cardStyle} onClick={onClick} {...ariaProps}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        <div onClick={stopPropagation}>
          {!!abcCode && <AbcNotation abcCode={abcCode} onRender={setAbcRenderResult} />}
          {!!playMidi && !!abcRenderResult && (
            <div className="MusicMapping-card-controls" style={{ marginTop: '0.5rem' }} onClick={stopPropagation}>
              <AbcPlayer renderResult={abcRenderResult} />
            </div>
          )}
        </div>
        {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
      </div>
      <div className="MusicMapping-clickArea" />
    </div>
  );

  return (
    <React.Fragment>
      {cardType === 'text' && renderTextCard()}
      {cardType === 'audio' && renderAudioCard()}
      {cardType === 'image' && renderImageCard()}
      {cardType === 'video' && renderVideoCard()}
      {cardType === 'abc' && renderAbcCard()}
    </React.Fragment>
  );
}

export default Card;

Card.propTypes = {
  elem: PropTypes.object.isRequired,
  mediaNumber: PropTypes.number,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool
};

Card.defaultProps = {
  mediaNumber: null,
  onClick: () => {},
  isSelected: false
};
