import joi from 'joi';
import React from 'react';
import MusicMappingIcon from './music-mapping-icon.js';
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
    return <MusicMappingIcon />;
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
      abcCode: '',
      playMidi: false,
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
    const elementSchema = joi.object({
      key: joi.string().required(),
      label: joi.string().allow('').required(),
      type: joi.string().valid('question', 'answer').required(),
      sourceUrl: joi.string().allow('').required(),
      text: joi.string().allow('').required(),
      cardType: joi.string().valid('text', 'image', 'audio', 'video', 'abc').required(),
      abcCode: joi.string().allow('').optional(),
      playMidi: joi.boolean().optional(),
      copyrightNotice: joi.string().allow('').required(),
      answers: joi.array().items(joi.string()).optional()
    });

    const answerMappingSchema = joi.array().ordered(
      joi.string().required(),
      joi.string().allow('').required()
    );

    const schema = joi.object({
      elements: joi.array().items(elementSchema).required(),
      answers: joi.array().items(answerMappingSchema).required()
    });

    joi.attempt(content, schema, { abortEarly: false, convert: false, noDefaults: true });
  }

  cloneContent(content) {
    return cloneDeep(content);
  }

  redactContent(content, targetRoomId) {
    const redactedContent = cloneDeep(content);

    const redactUrl = url => couldAccessUrlFromRoom(url, targetRoomId) ? url : '';

    redactedContent.elements = (redactedContent.elements ?? []).map(element => ({
      ...element,
      sourceUrl: redactUrl(element.sourceUrl),
      copyrightNotice: this.gfm.redactCdnResources(element.copyrightNotice ?? '', redactUrl)
    }));

    return redactedContent;
  }

  getCdnResources(content) {
    const resources = [];
    for (const element of content.elements ?? []) {
      if (element.sourceUrl) {
        resources.push(element.sourceUrl);
      }
      if (element.copyrightNotice) {
        resources.push(...this.gfm.extractCdnResources(element.copyrightNotice));
      }
    }
    return resources;
  }
}

export default MusicMappingInfo;
