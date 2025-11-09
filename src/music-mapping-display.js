/* eslint-disable react/jsx-no-leaked-render */
import Card from './Card.js';
import { Button } from 'antd';
import XarrowImport from 'react-xarrows';
import { useTranslation } from 'react-i18next';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { sectionDisplayProps } from '@educandu/educandu/ui/default-prop-types.js';

const Arrow = XarrowImport?.default ?? XarrowImport;

export default function MusicMappingDisplay({ content }) {
  const { elements = [], answers = [] } = content ?? {};
  const { t } = useTranslation('benewagner/educandu-plugin-music-mapping');

  const [shuffledElements, setShuffledElements] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]); // Array<[questionKey, answerKey]>
  const arrowIdentifiers = useRef(new Set()); // Set<'qKeyaKey'>
  const drawNewArrowRef = useRef({}); // { question?: key, answer?: key }

  const correctPairsRef = useRef([]); // Array<[qKey, aKey]>
  const correctIdsRef = useRef(new Set()); // Set<'qKeyaKey'>
  const [isCheck, setIsCheck] = useState(false);

  const arrowProps = {
    strokeWidth: 2.5,
    showHead: false,
    startAnchor: 'bottom',
    endAnchor: 'top'
  };

  const renderArrows = () => {
    const getArrowColor = (qKey, aKey) => {
      if (!isCheck) return '#c4c4c4';
      const id = `${qKey}${aKey}`;
      return correctIdsRef.current.has(id) ? '#4CAF50' : '#E57373';
    };

    const isUserAnswer = (qKey, aKey) => arrowIdentifiers.current.has(`${qKey}${aKey}`);

    return (
      <div>
        {userAnswers.map(([q, a]) => (
          <Arrow key={`ua-${q}-${a}`} start={q} end={a} color={getArrowColor(q, a)} {...arrowProps} />
        ))}
        {isCheck
          ? correctPairsRef.current.map(([q, a]) =>
              isUserAnswer(q, a)
                ? null
                : <Arrow key={`ca-${q}-${a}`} start={q} end={a} color="#2196F3" {...arrowProps} />
            )
          : null}
      </div>
    );
  };

  const toggleLoadedClass = id => {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    el.classList.toggle('MusicMapping-loaded-card');
  };

  const clearLoadedClass = id => {
    document.querySelector(`#${id}`)?.classList.remove('MusicMapping-loaded-card');
  };

  const handleCardClick = elem => {
    const oldQ = drawNewArrowRef.current.question;
    const oldA = drawNewArrowRef.current.answer;

    if (elem.type === 'question') {
      if (oldQ && oldQ !== elem.key) clearLoadedClass(oldQ);
      drawNewArrowRef.current.question = elem.key;

      if (oldA) {
        clearLoadedClass(oldA);
        const id = `${elem.key}${oldA}`;
        if (!arrowIdentifiers.current.has(id)) {
          arrowIdentifiers.current.add(id);
          setUserAnswers(prev => [...prev, [elem.key, oldA]]);
          drawNewArrowRef.current = {};
        }
      }
    } else {
      if (oldA && oldA !== elem.key) clearLoadedClass(oldA);
      drawNewArrowRef.current.answer = elem.key;

      if (oldQ) {
        clearLoadedClass(oldQ);
        const id = `${oldQ}${elem.key}`;
        if (!arrowIdentifiers.current.has(id)) {
          arrowIdentifiers.current.add(id);
          setUserAnswers(prev => [...prev, [oldQ, elem.key]]);
          drawNewArrowRef.current = {};
        }
      }
    }

    const hasOneSide =
      (drawNewArrowRef.current.question && !drawNewArrowRef.current.answer) ||
      (!drawNewArrowRef.current.question && drawNewArrowRef.current.answer);

    if (hasOneSide) {
      toggleLoadedClass(elem.key);
    }

    setIsCheck(false);
  };

  useLayoutEffect(() => {
    // Shuffle defensiv
    const elems = [...elements].sort(() => Math.random() - 0.5);

    // Baue die Menge korrekter Paare aus Question.answers (Antwort-KEYS) und answers (Key→Label)
    const answerKeySet = new Set((answers ?? []).map(a => a?.[0]));
    const pairs = [];
    const idSet = new Set();

    for (const el of elems) {
      if (el?.type !== 'question') continue;
      const qKey = el.key;
      const allowedAnswerKeys = el.answers ?? [];
      for (const aKey of allowedAnswerKeys) {
        if (!aKey || !answerKeySet.has(aKey)) continue;
        pairs.push([qKey, aKey]);
        idSet.add(`${qKey}${aKey}`);
      }
    }

    correctPairsRef.current = pairs;
    correctIdsRef.current = idSet;
    setShuffledElements(elems);
  }, [elements, answers]);

  if (!shuffledElements) return null;

  return (
    <div className='EP_Educandu_Example_Display'>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '200px', justifyContent: 'space-evenly', width: '100%' }}>
        <div className='MusicMapping-QuestionContainer' style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
          {shuffledElements.map(el =>
            el.type === 'question'
              ? <Card key={el.key} elem={el} onClick={() => handleCardClick(el)} />
              : null
          )}
        </div>

        <div className='MusicMapping-AnswerContainer' style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
          {shuffledElements.map(el =>
            el.type === 'answer'
              ? <Card key={el.key} elem={el} onClick={() => handleCardClick(el)} />
              : null
          )}
        </div>

        {renderArrows()}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button onClick={() => setIsCheck(prev => !prev)}>{t('check')}</Button>
        <Button
          onClick={() => {
            arrowIdentifiers.current.clear();
            setUserAnswers([]);
            setIsCheck(false);
          }}
        >
          {t('reset')}
        </Button>
      </div>
    </div>
  );
}

MusicMappingDisplay.propTypes = {
  ...sectionDisplayProps
};
