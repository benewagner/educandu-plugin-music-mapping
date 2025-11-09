/* eslint-disable react/jsx-no-leaked-render */
import React, { useRef, useId, useState, useEffect } from 'react';
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

  // defensiv: content kann fehlen
  const { elements = [], answers = [] } = content ?? {};

  const droppableIdRef = useRef(useId());
  const musicMappingInfo = useService(MusicMappingInfo);

  // Einmalige Normalisierung: Falls alte Inhalte Labels in question.answers hatten,
  // versuchen wir, diese auf Keys zu mappen.
  const didNormalizeRef = useRef(false);
  useEffect(() => {
    if (didNormalizeRef.current) return;

    const labelToKey = new Map((answers ?? []).map(([k, lbl]) => [lbl, k]));
    let changed = false;

    const normalized = (elements ?? []).map(el => {
      if (el?.type !== 'question') return el;
      const raw = el.answers ?? [];
      const mapped = raw.map(x => {
        // Wenn x bereits ein bekannter Key ist, so lassen; sonst über Label->Key map
        if ((answers ?? []).some(a => a?.[0] === x)) return x;
        return labelToKey.get(x) ?? x;
      });
      if (JSON.stringify(mapped) !== JSON.stringify(raw)) {
        changed = true;
        return { ...el, answers: mapped };
      }
      return el;
    });

    if (changed) {
      onContentChanged({ ...content, elements: normalized });
    }
    didNormalizeRef.current = true;
  }, [content, elements, answers, onContentChanged]);

  const changeContent = newContentValues => {
    const newContent = { ...content, ...newContentValues };
    onContentChanged(newContent);
  };

  // Element-Typ umschalten (question/answer)
  const handleElementTypeChanged = (event, index, elem) => {
    const value = event.target.value;
    const newElements = cloneDeep(elements);
    let newAnswers = [...(answers ?? [])];

    newElements[index].type = value;

    if (value === 'question') {
      // Wenn es vorher eine answer war: Mapping-Eintrag entfernen
      newAnswers = newAnswers.filter(a => a?.[0] !== elem.key);
      // Frage sollte keine Media-spezifischen Felder verlieren; belassen
      // answers-Liste der Frage bleibt unberührt
    } else {
      // Wird zu answer: Mapping [key, label] erzeugen (falls noch nicht vorhanden)
      const exists = newAnswers.some(a => a?.[0] === elem.key);
      if (!exists) {
        newAnswers.push([elem.key, newElements[index].label ?? '']);
      }
      // Falls es vorher eine Frage war: deren question.answers (Keys) bleiben bei der Frage,
      // aber dieses Element ist jetzt answer – andere Fragen behalten ihre Referenzen (Keys)
    }

    changeContent({ elements: newElements, answers: newAnswers });
  };

  // Karten-Content-Typ (text/image/audio/video)
  const handleCardTypeChanged = (event, index) => {
    const value = event.target.value;
    const newElements = cloneDeep(elements);
    newElements[index].cardType = value;
    if (value === 'text') {
      newElements[index].copyrightNotice = '';
      newElements[index].sourceUrl = '';
      newElements[index].clipEffect = 'none';
    }
    changeContent({ elements: newElements });
  };

  // Neues Element hinzufügen
  const handleAddButtonClick = () => {
    const newElements = cloneDeep(elements);
    newElements.push(musicMappingInfo.getDefaultElement());
    changeContent({ elements: newElements });
  };

  // Element löschen
  const handleDeleteElement = (index, elem) => {
    // 1) Element aus der Liste entfernen
    const newElements = removeItemAt(elements, index).map(el => {
      // Wenn ein Frage-Element gelöscht wird: nichts zu tun für andere
      // Wenn eine Antwort gelöscht wird: alle Fragen, die diesen Antwort-Key referenzieren, bereinigen
      if (el.type === 'question') {
        const old = el.answers ?? [];
        const filtered = old.filter(ansKey => ansKey !== elem.key);
        if (filtered.length !== old.length) {
          return { ...el, answers: filtered };
        }
      }
      return el;
    });

    // 2) Mapping-Eintrag entfernen, wenn das gelöschte Element eine Antwort war
    const newAnswers = (answers ?? []).filter(answer => answer?.[0] !== elem.key);

    changeContent({ elements: newElements, answers: newAnswers });
  };

  // Reihenfolge ändern (Up/Down oder Drag)
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

  // Text für Text-Karte
  const handleTextChanged = (event, index) => {
    const newElements = cloneDeep(elements);
    newElements[index].text = event.target.value;
    changeContent({ elements: newElements });
  };

  // Medien-URL ändern
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

  // Label-Änderung eines Elements
  const onLabelChange = (event, index, elem) => {
    const value = event.target.value;

    const newElements = cloneDeep(elements);
    newElements[index].label = value;

    let newAnswers = [...(answers ?? [])];
    if (elem.type === 'answer') {
      // Mapping-Eintrag [key, label] aktualisieren
      newAnswers = newAnswers.map(answer =>
        answer?.[0] === elem.key ? [answer[0], value] : answer
      );
    }

    changeContent({ elements: newElements, answers: newAnswers });
  };

  // Copyright Notice (Markdown) ändern
  const handleCopyrightNoticeChange = (event, index) => {
    const newElements = cloneDeep(elements);
    newElements[index].copyrightNotice = event.target.value;
    changeContent({ elements: newElements });
  };

  // Antworten der Frage ändern (hier werden Antwort-KEYS gespeichert)
  const handleAnswerChanged = (values, index) => {
    const newElements = cloneDeep(elements);
    newElements[index].answers = values ?? [];
    changeContent({ elements: newElements });
  };

  // UI-Subkomponenten
  const renderCopyrightNoticeInput = (value, onChangeHandler, index) => (
    <Form.Item label={t('common:copyrightNotice')} {...FORM_ITEM_LAYOUT}>
      <MarkdownInput value={value} onChange={e => onChangeHandler(e, index)} />
    </Form.Item>
  );

  const renderAnswerDropdown = index => (
    <Form.Item label={t('answers')} {...FORM_ITEM_LAYOUT}>
      <Select
        mode='multiple'
        allowClear
        value={(elements[index].answers ?? [])}
        onChange={vals => handleAnswerChanged(vals, index)}
        placeholder={t('selectAnswers')}
      >
        {(answers ?? []).map(answer => (
          <Select.Option key={answer[0]} value={answer[0]}>
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
          <Form.Item label={t('text')} {...FORM_ITEM_LAYOUT}>
            <Input value={elem.text} onChange={e => handleTextChanged(e, index)} />
          </Form.Item>
        )}

        {elem.cardType !== 'text' && renderCopyrightNoticeInput(elem.copyrightNotice, handleCopyrightNoticeChange, index)}

        {elem.type === 'question' && renderAnswerDropdown(index)}
      </ItemPanel>
    );
  };

  const dragAndDropPanelItems = (elements ?? []).map((elem, index) => ({
    key: elem.key,
    render: ({ dragHandleProps, isDragged, isOtherDragged }) =>
      renderElementItemPanel({ elem, index, dragHandleProps, isDragged, isOtherDragged })
  }));

  return (
    <div className='EP_Educandu_Example_Editor'>
      <Form labelAlign='left'>
        <DragAndDropContainer
          droppableId={droppableIdRef.current}
          items={dragAndDropPanelItems}
          onItemMove={handleMoveElement}
        />
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
