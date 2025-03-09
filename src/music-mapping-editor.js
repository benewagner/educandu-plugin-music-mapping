/* eslint-disable react/jsx-no-leaked-render */
import React, { useRef, useId, useState } from 'react';
import ItemPanel from './custom-item-panel.js';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import MusicMappingInfo from './music-mapping-info.js';
import { Form, Button, Radio, Input, Select } from 'antd';
import cloneDeep from '@educandu/educandu/utils/clone-deep.js';
import UrlInput from '@educandu/educandu/components/url-input.js';
import MarkdownInput from '@educandu/educandu/components/markdown-input.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import { FORM_ITEM_LAYOUT, SOURCE_TYPE } from '@educandu/educandu/domain/constants.js';
import DragAndDropContainer from '@educandu/educandu/components/drag-and-drop-container.js';
import { swapItemsAt, removeItemAt, ensureIsExcluded, moveItem } from '@educandu/educandu/utils/array-utils.js';

function createCopyrightForSource({ oldSourceUrl, oldCopyrightNotice, sourceUrl, metadata, t }) {
  if (oldSourceUrl === sourceUrl) {
    return oldCopyrightNotice;
  }
  if (!sourceUrl) {
    return '';
  }
  if (metadata.sourceType === SOURCE_TYPE.youtube && metadata.copyrightLink) {
    return t('common:youtubeCopyrightNotice', { link: metadata.copyrightLink });
  }
  if (metadata.sourceType === SOURCE_TYPE.wikimedia && metadata.copyrightLink) {
    return t('common:wikimediaCopyrightNotice', { link: metadata.copyrightLink });
  }
  return '';
}
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export default function MusicMappingEditor({ content, onContentChanged }) {
  const { t } = useTranslation('benewagner/educandu-plugin-music-mapping');
  const { elements, answers } = content;
  const droppableIdRef = useRef(useId());
  const musicMappingInfo = useService(MusicMappingInfo);

  const changeContent = newContentValues => {
    const newContent = { ...content, ...newContentValues };
    onContentChanged(newContent);
  };

  const handleElementTypeChanged = (event, index, elem) => {
    const value = event.target.value;
    const newElements = cloneDeep(elements);
    let newAnswers = [];
    newElements[index].type = value;
    if (value === 'question') {
      newAnswers = answers.filter(answer => answer[0] !== elem.key);
    } else {
      newAnswers = cloneDeep(answers);
      newAnswers.push([elem.key, elem.label]);
    }
    changeContent({ elements: newElements, answers: newAnswers });
  };

  const handleCardTypeChanged = (event, index) => {
    const value = event.target.value;
    const newElements = cloneDeep(elements);
    newElements[index].cardType = value;
    if (value === 'text') {
      newElements[index].copyrightNotice = '';
    }
    changeContent({ elements: newElements });
  };

  const handleAddButtonClick = () => {
    const newElements = cloneDeep(elements);
    newElements.push(musicMappingInfo.getDefaultElement());

    changeContent({ elements: newElements });
  };

  const handleDeleteElement = (index, elem) => {
    const newElements = removeItemAt(elements, index).map(element => {
      if (element.type === 'question') {
        element.answers = element.answers.filter(item => item !== elem.label);
      }
      return element;
    });
    const newAnswers = answers.filter(answer => answer[0] !== elem.key);
    changeContent({ elements: newElements, answers: newAnswers });
  };

  const handleMoveElementUp = index => {
    const newElements = swapItemsAt(elements, index, index - 1);
    changeContent({ elements: newElements });
  };

  const handleMoveElementDown = index => {
    const newElements = swapItemsAt(elements, index, index + 1);
    changeContent({ elements: newElements });
  };

  const handleMoveElement = (fromIndex, toIndex) => {
    changeContent({ elements: moveItem(elements, fromIndex, toIndex) });
  };

  const handleTextChanged = (event, index) => {
    const newElements = cloneDeep(elements);
    newElements[index].text = event.target.value;
    changeContent({ elements: newElements });
  };

  const handleSourceUrlChange = (value, metadata, elem, index) => {
    const newElements = cloneDeep(elements);
    newElements[index] = {
      ...elem,
      sourceUrl: value,
      copyrightNotice: createCopyrightForSource({
        oldSourceUrl: elem.sourceUrl,
        oldCopyrightNotice: elem.copyrightNotice,
        sourceUrl: value,
        metadata,
        t
      }),
      clipEffect: 'none'
    };
    changeContent({ elements: newElements });
  };

  const allowedImageSourceTypes = ensureIsExcluded(Object.values(SOURCE_TYPE), SOURCE_TYPE.youtube);

  const onLabelChange = (event, index, elem) => {
    const value = event.target.value;
    const newElements = cloneDeep(elements);
    newElements[index].label = value;
    const newAnswers = answers.map(answer => {
      if (answer[0] === elem.key) {
        answer[1] = value;
      }
      return answer;
    });
    changeContent({ elements: newElements, answers: newAnswers });
  };

  const handleCopyrightNoticeChange = (event, index) => {
    const newElements = cloneDeep(elements);
    newElements[index].copyrightNotice = event.target.value;
    changeContent({ elements: newElements });
  };

  const handleAnswerChanged = (event, index) => {
    const newElements = cloneDeep(elements);
    newElements[index].answers = event;
    changeContent({ elements: newElements });
  };

  const renderCopyrightNoticeInput = (value, onChangeHandler, index) => (
    <Form.Item label={t('common:copyrightNotice')} {...FORM_ITEM_LAYOUT}>
      <MarkdownInput value={value} onChange={e => onChangeHandler(e, index)} />
    </Form.Item>
  );

  const renderAnswerDropdown = index => (
    <Form.Item label='Antworten' {...FORM_ITEM_LAYOUT}>
      <Select mode='multiple' allowClear defaultValue={elements[index].answers} onChange={e => handleAnswerChanged(e, index)}>
        {answers.map(answer => (
          <Select.Option key={answer[0]} value={answer[1]}>
            {answer[1]}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );

  const renderElementItemPanel = ({ elem, index, dragHandleProps, isDragged, isOtherDragged }) => {
    return (
      <ItemPanel
        index={index}
        key={elem.key}
        itemsCount={elements.length}
        isDragged={isDragged}
        isOtherDragged={isOtherDragged}
        dragHandleProps={dragHandleProps}
        label={elem.label}
        onLabelChange={e => onLabelChange(e, index, elem)}
        elemType={elem.type}
        type={elem.type}
        onMoveUp={handleMoveElementUp}
        onMoveDown={handleMoveElementDown}
        onDelete={i => handleDeleteElement(i, elem)}
      >
        <FormItem label={t('elementType')} {...FORM_ITEM_LAYOUT}>
          <RadioGroup value={elem.type} onChange={event => handleElementTypeChanged(event, index, elem)}>
            <RadioButton value='question'>{t('question')}</RadioButton>
            <RadioButton value='answer'>{t('answer')}</RadioButton>
          </RadioGroup>
        </FormItem>

        {/* <Divider plain>{t(elem.type)}</Divider> */}
        <FormItem label={t('cardType')} {...FORM_ITEM_LAYOUT}>
          <RadioGroup value={elem.cardType} onChange={event => handleCardTypeChanged(event, index)}>
            <RadioButton value='text'>{t('text')}</RadioButton>
            <RadioButton value='image'>{t('image')}</RadioButton>
            <RadioButton value='audio'>{t('audio')}</RadioButton>
            <RadioButton value='video'>{t('video')}</RadioButton>
          </RadioGroup>
        </FormItem>
        {elem.cardType !== 'text' && (
          <Form.Item label={t('URL')} {...FORM_ITEM_LAYOUT}>
            <UrlInput
              value={elem.sourceUrl}
              allowedSourceTypes={allowedImageSourceTypes}
              onChange={(value, metadata) => handleSourceUrlChange(value, metadata, elem, index)}
            />
          </Form.Item>
        )}
        {elem.cardType === 'text' && (
          <Form.Item label='Text' {...FORM_ITEM_LAYOUT}>
            <Input value={elem.text} onChange={e => handleTextChanged(e, index)} />
          </Form.Item>
        )}
        {elem.cardType !== 'text' && renderCopyrightNoticeInput(elem.copyrightNotice, handleCopyrightNoticeChange, index)}
        {elem.type === 'question' && renderAnswerDropdown(index)}
      </ItemPanel>
    );
  };

  const dragAndDropPanelItems = elements.map((elem, index) => ({
    key: elem.key,
    render: ({ dragHandleProps, isDragged, isOtherDragged }) =>
      renderElementItemPanel({ elem, index, dragHandleProps, isDragged, isOtherDragged })
  }));

  return (
    <div className='EP_Educandu_Example_Editor'>
      <Form labelAlign='left'>
        <DragAndDropContainer droppableId={droppableIdRef.current} items={dragAndDropPanelItems} onItemMove={handleMoveElement} />
      </Form>
      <Button type='primary' icon={<PlusOutlined />} onClick={handleAddButtonClick}>
        {t('addElement')}
      </Button>
    </div>
  );
}

MusicMappingEditor.propTypes = {
  ...sectionEditorProps
};
