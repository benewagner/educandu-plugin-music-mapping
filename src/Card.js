import React from 'react';
import PropTypes from 'prop-types';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import MediaPlayer from '@educandu/educandu/components/media-player/media-player.js';
import { MEDIA_SCREEN_MODE } from '@educandu/educandu/domain/constants.js';
import { getAccessibleUrl, isInternalSourceType } from '@educandu/educandu/utils/source-utils.js';

function Card({ elem, onClick }) {
  const { cardType, text, sourceUrl, key } = elem;
  const cardId = `card-${key}`;
  const clientConfig = useService(ClientConfig);

  // Convert CDN URLs to accessible URLs
  const accessibleUrl = getAccessibleUrl({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });
  const allowDownload = isInternalSourceType({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });

  const cardStyle = {
    border: '1px solid lightgrey',
    borderRadius: '8px',
    cursor: 'pointer',
    padding: '0.8rem',
    width: '300px',
    boxSizing: 'border-box'
  };

  const stopPropagation = e => e.stopPropagation();

  const renderAudioCard = () => (
    <div id={cardId} style={cardStyle} onClick={onClick}>
      <div onClick={stopPropagation}>
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
  );

  const renderTextCard = () => (
    <div id={cardId} style={cardStyle} onClick={onClick}>
      {text !== '' ? <div>{text}</div> : null}
    </div>
  );

  const renderImageCard = () => (
    <div id={cardId} style={cardStyle} onClick={onClick}>
      <img
        src={accessibleUrl}
        alt={text || ''}
        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
        />
      {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
    </div>
  );

  const renderVideoCard = () => (
    <div id={cardId} style={cardStyle} onClick={onClick}>
      <div onClick={stopPropagation}>
        {!!accessibleUrl && (
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
      </div>
      {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
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
