import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import MediaPlayer from '@educandu/educandu/components/media-player/media-player.js';
import AbcNotation from '@educandu/educandu/components/abc-notation.js';
import AbcPlayer from '@educandu/educandu/components/abc-player.js';
import { MEDIA_SCREEN_MODE } from '@educandu/educandu/domain/constants.js';
import { getAccessibleUrl, isInternalSourceType } from '@educandu/educandu/utils/source-utils.js';

function Card({ elem, mediaNumber, onClick }) {
  const { cardType, text, sourceUrl, key, abcCode, playMidi, type } = elem;
  const cardId = `card-${key}`;
  const clientConfig = useService(ClientConfig);
  const [abcRenderResult, setAbcRenderResult] = useState(null);

  // Convert CDN URLs to accessible URLs
  const accessibleUrl = getAccessibleUrl({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });
  const allowDownload = isInternalSourceType({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });

  const isQuestion = type === 'question';

  const cardStyle = {
    display: 'flex',
    flexDirection: isQuestion ? 'row' : 'row-reverse',
    border: '1px solid lightgrey',
    cursor: 'pointer',
    width: '340px',
    boxSizing: 'border-box'
  };

  const cardClassName = `MusicMapping-card MusicMapping-card--${type}`;

  const contentStyle = {
    flex: 1,
    padding: '0.8rem'
  };

  const stopPropagation = e => e.stopPropagation();

  const renderAudioCard = () => (
    <div id={cardId} className={cardClassName} style={cardStyle} onClick={onClick}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        {mediaNumber && (
          <div className="MusicMapping-card-mediaPreview">
            Audio {mediaNumber}
          </div>
        )}
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
    <div id={cardId} className={cardClassName} style={cardStyle} onClick={onClick}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        {text !== '' ? <div>{text}</div> : null}
      </div>
      <div className="MusicMapping-clickArea" />
    </div>
  );

  const renderImageCard = () => (
    <div id={cardId} className={cardClassName} style={cardStyle} onClick={onClick}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        <img
          src={accessibleUrl}
          alt={text || ''}
          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        {text !== '' ? <p style={{ margin: '0.5rem 0 0 0' }}>{text}</p> : null}
      </div>
      <div className="MusicMapping-clickArea" />
    </div>
  );

  const renderVideoCard = () => (
    <div id={cardId} className={`${cardClassName} MusicMapping-card--video`} style={cardStyle} onClick={onClick}>
      <div className="MusicMapping-card-content" style={contentStyle}>
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
      <div className="MusicMapping-clickArea" />
    </div>
  );

  const renderAbcCard = () => (
    <div id={cardId} className={`${cardClassName} MusicMapping-card--abc`} style={cardStyle} onClick={onClick}>
      <div className="MusicMapping-card-content" style={contentStyle}>
        <div onClick={stopPropagation}>
          {!!abcCode && <AbcNotation abcCode={abcCode} onRender={setAbcRenderResult} />}
          {playMidi && abcRenderResult && (
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
  onClick: PropTypes.func
};

Card.defaultProps = {
  mediaNumber: null,
  onClick: () => {}
};
