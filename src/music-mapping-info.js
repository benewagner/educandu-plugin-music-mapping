import joi from 'joi';
import React from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import uniqueId from '@educandu/educandu/utils/unique-id.js';
import cloneDeep from '@educandu/educandu/utils/clone-deep.js';
import { couldAccessUrlFromRoom } from '@educandu/educandu/utils/source-utils.js';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';

class MusicMappingInfo {
  static dependencies = [GithubFlavoredMarkdown];

  static typeName = 'benewagner/educandu-plugin-music-mapping';

  constructor(gfm) {
    this.gfm = gfm;
  }

  getDisplayName(t) {
    return t('benewagner/educandu-plugin-music-mapping:name');
  }

  getIcon() {
    return <ClockCircleOutlined />;
  }

  async resolveDisplayComponent() {
    return (await import('./music-mapping-display.js')).default;
  }

  async resolveEditorComponent() {
    return (await import('./music-mapping-editor.js')).default;
  }

  getDefaultElement() {
    return {
      key: uniqueId.create(),
      label: '',
      type: 'question',
      sourceUrl: '',
      text: '',
      cardType: 'text',
      copyrightNotice: ''
    };
  }

  getDefaultContent() {
    return {
      elements: [this.getDefaultElement()],
      answers: []
    };
  }

  validateContent(content) {
    const schema = joi.object({
      elements: joi.array(),
      answers: joi.array()
    });

    joi.attempt(content, schema, { abortEarly: false, convert: false, noDefaults: true });
  }

  cloneContent(content) {
    return cloneDeep(content);
  }

  redactContent(content, targetRoomId) {
    const redactedContent = cloneDeep(content);

    redactedContent.text = this.gfm.redactCdnResources(redactedContent.text, url => (couldAccessUrlFromRoom(url, targetRoomId) ? url : ''));

    return redactedContent;
  }

  getCdnResources(content) {
    return this.gfm.extractCdnResources(content.text);
  }
}

export default MusicMappingInfo;
