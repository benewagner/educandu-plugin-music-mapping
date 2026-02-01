/* eslint-disable react/jsx-no-leaked-render */
import Card from './Card.js';
import { Button } from 'antd';
import XarrowImport from 'react-xarrows';
import { useTranslation } from 'react-i18next';
import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import { sectionDisplayProps } from '@educandu/educandu/ui/default-prop-types.js';

const Arrow = XarrowImport?.default ?? XarrowImport;

// Fisher-Yates shuffle for unbiased randomization
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MusicMappingDisplay({ content }) {
  const { elements = [], answers = [] } = content ?? {};
  const { t } = useTranslation('benewagner/educandu-plugin-music-mapping');

  const [shuffledElements, setShuffledElements] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]); // Array<[questionKey, answerKey]>
  const arrowIdentifiers = useRef(new Set()); // Set<'qKeyaKey'>
  const drawNewArrowRef = useRef({}); // { question?: key, answer?: key }
  const [selectedKeys, setSelectedKeys] = useState({ question: null, answer: null });

  const correctPairsRef = useRef([]); // Array<[qKey, aKey]>
  const correctIdsRef = useRef(new Set()); // Set<'qKeyaKey'>
  const [isCheck, setIsCheck] = useState(false);

  const arrowProps = {
    strokeWidth: 2.5,
    showHead: true,
    startAnchor: 'right',
    endAnchor: 'left'
  };

  const getCardId = key => `card-${key}`;

  // Build a map from element key to label for ARIA descriptions
  const elementLabelMap = useMemo(() => {
    const map = new Map();
    (elements ?? []).forEach(el => {
      map.set(el.key, el.label || el.text || el.key);
    });
    return map;
  }, [elements]);

  const handleArrowClick = (qKey, aKey) => {
    const id = `${qKey}${aKey}`;
    arrowIdentifiers.current.delete(id);
    setUserAnswers(prev => prev.filter(([q, a]) => !(q === qKey && a === aKey)));
    setIsCheck(false);
  };

  const renderArrows = () => {
    const getArrowColor = (qKey, aKey) => {
      if (!isCheck) {return '#c4c4c4';}
      const id = `${qKey}${aKey}`;
      return correctIdsRef.current.has(id) ? '#4CAF50' : '#E57373';
    };

    const isUserAnswer = (qKey, aKey) => arrowIdentifiers.current.has(`${qKey}${aKey}`);

    const hitAreaProps = (q, a) => ({
      'onClick': () => handleArrowClick(q, a),
      'onKeyDown': e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleArrowClick(q, a);
        }
      },
      'style': { cursor: 'pointer' },
      'className': 'MusicMapping-arrowHitArea',
      'tabIndex': 0,
      'role': 'button',
      'aria-label': t('ariaConnectionRemove', {
        question: elementLabelMap.get(q),
        answer: elementLabelMap.get(a)
      })
    });

    return (
      <div>
        {userAnswers.map(([q, a]) => (
          <React.Fragment key={`ua-${q}-${a}`}>
            {/* Invisible hit area with larger stroke width */}
            <Arrow
              start={getCardId(q)}
              end={getCardId(a)}
              color="transparent"
              strokeWidth={20}
              showHead={false}
              startAnchor="right"
              endAnchor="left"
              passProps={hitAreaProps(q, a)}
              />
            {/* Visible arrow */}
            <Arrow
              start={getCardId(q)}
              end={getCardId(a)}
              color={getArrowColor(q, a)}
              {...arrowProps}
              passProps={{ style: { pointerEvents: 'none' } }}
              />
          </React.Fragment>
        ))}
        {isCheck
          ? correctPairsRef.current.map(([q, a]) =>
            isUserAnswer(q, a)
              ? null
              : <Arrow key={`ca-${q}-${a}`} start={getCardId(q)} end={getCardId(a)} color="#2196F3" {...arrowProps} />
          )
          : null}
      </div>
    );
  };

  const toggleLoadedClass = key => {
    const el = document.getElementById(getCardId(key));
    if (!el) {return;}
    el.classList.toggle('MusicMapping-loaded-card');
  };

  const clearLoadedClass = key => {
    document.getElementById(getCardId(key))?.classList.remove('MusicMapping-loaded-card');
  };

  const handleCardClick = elem => {
    const oldQ = drawNewArrowRef.current.question;
    const oldA = drawNewArrowRef.current.answer;

    if (elem.type === 'question') {
      // Clicking the same question again deselects it
      if (oldQ === elem.key) {
        clearLoadedClass(elem.key);
        delete drawNewArrowRef.current.question;
        setSelectedKeys(prev => ({ ...prev, question: null }));
        setIsCheck(false);
        return;
      }

      if (oldQ) {clearLoadedClass(oldQ);}
      drawNewArrowRef.current.question = elem.key;

      if (oldA) {
        clearLoadedClass(oldA);
        const id = `${elem.key}${oldA}`;
        if (!arrowIdentifiers.current.has(id)) {
          arrowIdentifiers.current.add(id);
          setUserAnswers(prev => [...prev, [elem.key, oldA]]);
        } else {
          arrowIdentifiers.current.delete(id);
          setUserAnswers(prev => prev.filter(([q, a]) => !(q === elem.key && a === oldA)));
        }
        drawNewArrowRef.current = {};
        setSelectedKeys({ question: null, answer: null });
      } else {
        toggleLoadedClass(elem.key);
        setSelectedKeys(prev => ({ ...prev, question: elem.key }));
      }
    } else {
      // Clicking the same answer again deselects it
      if (oldA === elem.key) {
        clearLoadedClass(elem.key);
        delete drawNewArrowRef.current.answer;
        setSelectedKeys(prev => ({ ...prev, answer: null }));
        setIsCheck(false);
        return;
      }

      if (oldA) {clearLoadedClass(oldA);}
      drawNewArrowRef.current.answer = elem.key;

      if (oldQ) {
        clearLoadedClass(oldQ);
        const id = `${oldQ}${elem.key}`;
        if (!arrowIdentifiers.current.has(id)) {
          arrowIdentifiers.current.add(id);
          setUserAnswers(prev => [...prev, [oldQ, elem.key]]);
        } else {
          arrowIdentifiers.current.delete(id);
          setUserAnswers(prev => prev.filter(([q, a]) => !(q === oldQ && a === elem.key)));
        }
        drawNewArrowRef.current = {};
        setSelectedKeys({ question: null, answer: null });
      } else {
        toggleLoadedClass(elem.key);
        setSelectedKeys(prev => ({ ...prev, answer: elem.key }));
      }
    }

    setIsCheck(false);
  };

  useLayoutEffect(() => {
    const elems = shuffleArray(elements);

    // Baue die Menge korrekter Paare aus Question.answers (Antwort-KEYS) und answers (Key→Label)
    const answerKeySet = new Set((answers ?? []).map(a => a?.[0]));
    const pairs = [];
    const idSet = new Set();

    elems
      .filter(el => el?.type === 'question')
      .forEach(el => {
        const qKey = el.key;
        (el.answers ?? [])
          .filter(aKey => aKey && answerKeySet.has(aKey))
          .forEach(aKey => {
            pairs.push([qKey, aKey]);
            idSet.add(`${qKey}${aKey}`);
          });
      });

    correctPairsRef.current = pairs;
    correctIdsRef.current = idSet;
    setShuffledElements(elems);
  }, [elements, answers]);

  if (!shuffledElements) {return null;}

  // Build media number map: assign sequential numbers to all audio and video cards
  const mediaNumberMap = new Map();
  let mediaCounter = 1;
  shuffledElements.forEach(el => {
    if (el.cardType === 'audio' || el.cardType === 'video') {
      mediaNumberMap.set(el.key, mediaCounter);
      mediaCounter += 1;
    }
  });

  return (
    <div className='EP_Educandu_Example_Display' role="region" aria-label={t('ariaExerciseRegion')}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '100px', width: '100%' }}>
        <div
          className='MusicMapping-QuestionContainer'
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, alignItems: 'flex-start' }}
          role="group"
          aria-label={t('ariaQuestionsRegion')}
          >
          {shuffledElements.map(el =>
            el.type === 'question'
              ? <Card
                  key={el.key}
                  elem={el}
                  mediaNumber={mediaNumberMap.get(el.key)}
                  onClick={() => handleCardClick(el)}
                  isSelected={selectedKeys.question === el.key}
                  />
              : null
          )}
        </div>

        <div
          className='MusicMapping-AnswerContainer'
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, alignItems: 'flex-end' }}
          role="group"
          aria-label={t('ariaAnswersRegion')}
          >
          {shuffledElements.map(el =>
            el.type === 'answer'
              ? <Card
                  key={el.key}
                  elem={el}
                  mediaNumber={mediaNumberMap.get(el.key)}
                  onClick={() => handleCardClick(el)}
                  isSelected={selectedKeys.answer === el.key}
                  />
              : null
          )}
        </div>

        {renderArrows()}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button onClick={() => setIsCheck(prev => !prev)}>{t('check')}</Button>
        <Button
          onClick={() => {
            arrowIdentifiers.current.clear();
            drawNewArrowRef.current = {};
            setSelectedKeys({ question: null, answer: null });
            setUserAnswers([]);
            setIsCheck(false);
            // Clear any visual selection classes
            shuffledElements.forEach(el => clearLoadedClass(el.key));
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
