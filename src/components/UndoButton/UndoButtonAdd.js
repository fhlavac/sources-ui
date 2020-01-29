import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { removeMessage, undoAddSource } from '../../redux/sources/actions';
import { routes } from '../../Routes';
import { refreshPage } from './refreshPage';

const UndoButton = ({ messageId, values }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const notifications = useSelector(({ notifications }) => notifications);

    return (
        <Button variant="link" isInline onClick={() => {
            const notification = notifications.find(({ customId }) => customId === messageId);

            if (notification) {
                dispatch(removeMessage(notification.id));
            }

            dispatch(undoAddSource(values));

            const isOnWizard = history.location.pathname === routes.sourcesNew.path;

            if (isOnWizard) {
                refreshPage(history);
            } else {
                history.push(routes.sourcesNew.path);
            }
        }}>
            <FormattedMessage
                id="sources.undo"
                defaultMessage="Undo"
            />
        </Button>
    );};

UndoButton.propTypes = {
    messageId: PropTypes.number.isRequired,
    values: PropTypes.object.isRequired
};

export default UndoButton;
