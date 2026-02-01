import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapse, Tooltip } from 'antd';
import DeleteIcon from '@educandu/educandu/components/icons/general/delete-icon.js';
import MoveUpIcon from '@educandu/educandu/components/icons/general/move-up-icon.js';
import MoveDownIcon from '@educandu/educandu/components/icons/general/move-down-icon.js';
import { confirmDeleteItem } from '@educandu/educandu/components/confirmation-dialogs.js';

function ItemPanel({
  index,
  label,
  elemType,
  answerNames,
  questionNames,
  children,
  dragHandleProps,
  isDragged,
  isOtherDragged,
  itemsCount,
  canDeleteLastItem,
  extraActionButtons,
  onMoveUp,
  onMoveDown,
  onDelete,
  onExtraActionButtonClick
}) {
  const { t } = useTranslation('benewagner/educandu-plugin-music-mapping');

  const handleActionButtonWrapperClick = (event, actionButton) => {
    if (actionButton.disabled) {
      event.stopPropagation();
    }
  };

  const handleActionButtonClick = (event, actionButton) => {
    event.stopPropagation();

    switch (actionButton.key) {
      case 'moveUp':
        return onMoveUp(index);
      case 'moveDown':
        return onMoveDown(index);
      case 'delete':
        return confirmDeleteItem(t, label, () => onDelete(index));
      default:
        return onExtraActionButtonClick(actionButton.key);
    }
  };

  const actionButtons = [];
  if (onMoveUp) {
    actionButtons.push({
      key: 'moveUp',
      title: null,
      icon: <MoveUpIcon />,
      disabled: index === 0
    });
  }
  if (onMoveDown) {
    actionButtons.push({
      key: 'moveDown',
      title: null,
      icon: <MoveDownIcon />,
      disabled: index === itemsCount - 1
    });
  }
  if (onDelete) {
    const isDeleteDisabled = !canDeleteLastItem && itemsCount <= 1;
    actionButtons.push({
      key: 'delete',
      title: t('common:delete'),
      icon: <DeleteIcon />,
      danger: !isDeleteDisabled,
      disabled: isDeleteDisabled
    });
  }

  actionButtons.push(...extraActionButtons);

  const renderActionButtons = () => {
    if (!actionButtons.length) {
      return null;
    }
    return (
      <div className='ItemPanel-actionButtons'>
        {actionButtons.map(actionButton => (
          <div key={actionButton.key} onClick={event => handleActionButtonWrapperClick(event, actionButton)}>
            <Tooltip title={actionButton.title}>
              <Button
                type='text'
                size='small'
                icon={actionButton.icon}
                disabled={actionButton.disabled}
                className={classNames('u-action-button', { 'u-danger-action-button': actionButton.danger })}
                onClick={event => handleActionButtonClick(event, actionButton)}
                />
            </Tooltip>
          </div>
        ))}
      </div>
    );
  };

  const renderHeader = () => {
    const isQuestion = elemType === 'question';
    const isAnswer = elemType === 'answer';
    const displayName = label || '—';
    const answersText = answerNames?.length > 0 ? answerNames.join(', ') : '—';
    const questionsText = questionNames?.length > 0 ? questionNames.join(', ') : '—';

    return (
      <div
        className='ItemPanel-header'
        {...dragHandleProps}
        style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem', height: '32px', gap: '0.5rem' }}
        >
        <span><strong>{t(elemType)}:</strong> {displayName}</span>
        {!!isQuestion && (
          <span style={{ color: '#666' }}>
            | <strong>{t('answers')}:</strong> {answersText}
          </span>
        )}
        {!!isAnswer && (
          <span style={{ color: '#666' }}>
            | <strong>{t('questions')}:</strong> {questionsText}
          </span>
        )}
      </div>
    );
  };

  return (
    <Collapse
      collapsible='icon'
      className={classNames('ItemPanel', { 'is-dragged': isDragged, 'is-other-dragged': isOtherDragged })}
      defaultActiveKey={null}
      >
      <Collapse.Panel key='panel' header={renderHeader()} extra={renderActionButtons()}>
        <div className='ItemPanel-contentWrapper'>{children}</div>
      </Collapse.Panel>
    </Collapse>
  );
}

ItemPanel.propTypes = {
  canDeleteLastItem: PropTypes.bool,
  children: PropTypes.node.isRequired,
  extraActionButtons: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.node,
      danger: PropTypes.bool,
      disabled: PropTypes.bool
    })
  ),
  label: PropTypes.string,
  elemType: PropTypes.string.isRequired,
  answerNames: PropTypes.arrayOf(PropTypes.string),
  questionNames: PropTypes.arrayOf(PropTypes.string),
  index: PropTypes.number,
  dragHandleProps: PropTypes.object,
  isDragged: PropTypes.bool,
  isOtherDragged: PropTypes.bool,
  itemsCount: PropTypes.number,
  onDelete: PropTypes.func,
  onExtraActionButtonClick: PropTypes.func,
  onMoveDown: PropTypes.func,
  onMoveUp: PropTypes.func
};

ItemPanel.defaultProps = {
  canDeleteLastItem: false,
  extraActionButtons: [],
  label: '',
  answerNames: [],
  questionNames: [],
  index: 0,
  dragHandleProps: null,
  isDragged: false,
  isOtherDragged: false,
  itemsCount: 1,
  onDelete: null,
  onExtraActionButtonClick: () => {},
  onMoveDown: null,
  onMoveUp: null
};

export default ItemPanel;
