import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Collapse, Input, Tooltip } from 'antd';
import DeleteIcon from '@educandu/educandu/components/icons/general/delete-icon.js';
import MoveUpIcon from '@educandu/educandu/components/icons/general/move-up-icon.js';
import MoveDownIcon from '@educandu/educandu/components/icons/general/move-down-icon.js';
import { confirmDeleteItem } from '@educandu/educandu/components/confirmation-dialogs.js';

function ItemPanel({
  index,
  label,
  elemType,
  onLabelChange,
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
  const [isOpen, setIsOpen] = useState(true);

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
    if (isOpen) {
      return (
        <div
          {...dragHandleProps}
          className='ItemPanel-header MusicMapping-header'
          style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}
          spellCheck={false}
        >
          <span style={{ marginRight: '0.5rem' }}>{`${t(elemType)}: `}</span>
          <Input value={label} placeholder='Namen eingeben...' style={{ maxWidth: '170px' }} onChange={onLabelChange} />
        </div>
      );
    }
    return (
      <div
        className='ItemPanel-header'
        {...dragHandleProps}
        style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem', height: '32px' }}
      >
        <span style={{ marginRight: '20px' }}>{`${t(elemType)}:`}</span>
        <span>{label}</span>
      </div>
    );
  };

  useLayoutEffect(() => {
    const headers = document.querySelectorAll('.MusicMapping-header');
    for (const header of headers) {
      const grandParent = header.parentElement.parentElement;
      // const iconToggle = grandParent.firstChild;
      // iconToggle.addEventListener('click', () => setIsOpen(prev => !prev));
      grandParent.classList.add('mm-align-center');
    }
  }, []);

  return (
    <Collapse
      collapsible='icon'
      className={classNames('ItemPanel', { 'is-dragged': isDragged, 'is-other-dragged': isOtherDragged })}
      defaultActiveKey='panel'
      onChange={() => setIsOpen(prev => !prev)}
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
  index: PropTypes.number,
  dragHandleProps: PropTypes.object,
  isDragged: PropTypes.bool,
  isOtherDragged: PropTypes.bool,
  itemsCount: PropTypes.number,
  onDelete: PropTypes.func,
  onExtraActionButtonClick: PropTypes.func,
  onMoveDown: PropTypes.func,
  onMoveUp: PropTypes.func,
  onLabelChange: PropTypes.func.isRequired
};

ItemPanel.defaultProps = {
  canDeleteLastItem: false,
  extraActionButtons: [],
  label: '',
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
