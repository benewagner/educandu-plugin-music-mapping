import Card from './Card.js';
import { Button } from 'antd';
import Xarrow from 'react-xarrows';
import { useTranslation } from 'react-i18next';
import cloneDeep from '@educandu/educandu/utils/clone-deep.js';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { sectionDisplayProps } from '@educandu/educandu/ui/default-prop-types.js';

const Arrow = Xarrow.default;

export default function ServerTimeDisplay({ content }) {
  const { elements, answers } = content;
  const { t } = useTranslation('benewagner/educandu-plugin-music-mapping');
  const [shuffledElements, setShuffledElements] = useState(null);
  const drawNewArrowRef = useRef({});
  const [userAnswers, setUserAnswers] = useState([]);
  const arrowIdentifiers = useRef(new Set());
  const correctAnswersRef = useRef([]);
  const correctArrowIdentifiers = useRef(null);
  const [isCheck, setIsCheck] = useState(false);

  const arrowProps = {
    strokeWidth: 2.5,
    showHead: false,
    startAnchor: 'bottom',
    endAnchor: 'top'
  };

  const renderArrows = () => {
    const getArrowColor = elem => {
      if (!isCheck) {
        return '#c4c4c4';
      }
      const [questionId, answerId] = elem;
      const identifier = questionId + answerId;
      return correctArrowIdentifiers.current.has(identifier) ? '#4CAF50' : '#E57373';
    };

    const isUserAnswer = answer => {
      const identifier = answer[0] + answer[1];
      return arrowIdentifiers.current.has(identifier);
    };

    return (
      <div>
        {userAnswers.map(elem => (
          <Arrow key={Math.random()} start={elem[0]} end={elem[1]} color={getArrowColor(elem)} {...arrowProps} />
        ))}
        {isCheck
          ? correctAnswersRef.current.map(elem => {
              if (!isUserAnswer(elem)) {
                return <Arrow key={Math.random()} start={elem[0]} end={elem[1]} color='#2196F3' {...arrowProps} />;
              }
              return null;
            })
          : null}
      </div>
    );
  };

  const handleCardClick = elem => {
    const currentCard = document.querySelector(`#${elem.key}`);
    const oldQuestionId = drawNewArrowRef.current.question;
    const oldAnswerId = drawNewArrowRef.current.answer;
    if (elem.type === 'question') {
      oldQuestionId &&
        oldQuestionId !== elem.key &&
        document.querySelector(`#${oldQuestionId}`).classList.remove('MusicMapping-loaded-card');
      drawNewArrowRef.current.question = elem.key;
      if (oldAnswerId) {
        document.querySelector(`#${oldAnswerId}`).classList.remove('MusicMapping-loaded-card');
        const identifier = elem.key + oldAnswerId;
        if (!arrowIdentifiers.current.has(identifier)) {
          arrowIdentifiers.current.add(identifier);
          const newUserAnswers = cloneDeep(userAnswers);
          newUserAnswers.push([elem.key, oldAnswerId]);
          setUserAnswers(newUserAnswers);
          drawNewArrowRef.current = {};
        }
      }
    } else {
      oldAnswerId && oldAnswerId !== elem.key && document.querySelector(`#${oldAnswerId}`).classList.remove('MusicMapping-loaded-card');
      drawNewArrowRef.current.answer = elem.key;
      if (oldQuestionId) {
        document.querySelector(`#${oldQuestionId}`).classList.remove('MusicMapping-loaded-card');
        const identifier = oldQuestionId + elem.key;
        if (!arrowIdentifiers.current.has(identifier)) {
          arrowIdentifiers.current.add(identifier);
          const newUserAnswers = cloneDeep(userAnswers);
          newUserAnswers.push([oldQuestionId, elem.key]);
          setUserAnswers(newUserAnswers);
          drawNewArrowRef.current = {};
        }
      }
    }
    if (
      (drawNewArrowRef.current.question && !drawNewArrowRef.current.answer) ||
      (!drawNewArrowRef.current.question && drawNewArrowRef.current.answer)
    ) {
      if (currentCard.classList.contains('MusicMapping-loaded-card')) {
        currentCard.classList.remove('MusicMapping-loaded-card');
      } else {
        currentCard.classList.add('MusicMapping-loaded-card');
      }
    }
    setIsCheck(false);
  };

  useLayoutEffect(() => {
    const elems = [...elements].sort(() => Math.random() - 0.5);
    const arr = [];

    const set = new Set();
    for (const elem of elems) {
      if (elem.type === 'question') {
        for (const elemAnswer of elem.answers) {
          for (const answer of answers) {
            if (answer[1] === elemAnswer) {
              arr.push([elem.key, answer[0]]);
              set.add(`${elem.key}${answer[0]}`);
            }
          }
        }
      }
    }
    correctAnswersRef.current = [...arr];
    correctArrowIdentifiers.current = set;
    setShuffledElements(elems);
  }, []);

  if (!shuffledElements) {
    return null;
  }

  return (
    <div className='EP_Educandu_Example_Display'>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '200px', justifyContent: 'space-evenly', width: '100%' }}>
        <div className='MusicMapping-QuestionContainer' style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
          {shuffledElements.map(elem => {
            if (elem.type === 'question') {
              return <Card key={elem.key} elem={elem} onClick={() => handleCardClick(elem)} />;
            }
            return null;
          })}
        </div>
        <div className='MusicMapping-AnswerContainer' style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%' }}>
          {shuffledElements.map(elem => {
            if (elem.type === 'answer') {
              return <Card elem={elem} key={elem.key} onClick={() => handleCardClick(elem)} />;
            }
            return null;
          })}
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

ServerTimeDisplay.propTypes = {
  ...sectionDisplayProps
};
