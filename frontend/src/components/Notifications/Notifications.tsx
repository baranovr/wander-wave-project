import './Notifications.scss';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  deleteAllNotifications,
  deleteNotification,
  fetchAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../features/notificationsSlice';
import classNames from 'classnames';

export const Notifications = () => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(
    state => state.notifications,
  );
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [visibleNotifications, setVisibleNotifications] = useState(false);

  useEffect(() => {
    dispatch(fetchAllNotifications());
  }, [dispatch]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead()).then(() => {
      dispatch(fetchAllNotifications());
    });
  };

  const handleMarkAsRead = (id: number, text: string) => {
    dispatch(markNotificationAsRead({ text, id })).then(() => {
      dispatch(fetchAllNotifications());
    });
  };

  const handleDelete = (id: number, text: string) => {
    dispatch(deleteNotification({ id, text })).then(() => {
      dispatch(fetchAllNotifications());
    });
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllNotifications()).then(() => {
      dispatch(fetchAllNotifications());
    });
    setVisibleNotifications(false);
  };

  const filteredNotification = useMemo(() => {
  return [...notifications].sort((a, b) => {
    return +b.created_at.slice(0, 19).replaceAll(
        '-', ''
        ).replaceAll(':', ''
        ).replace('T', ''
        ) -
           +a.created_at.slice(0, 19).replaceAll(
               '-', ''
           ).replaceAll(':', ''
           ).replace('T', ''
           );
  });
}, [notifications]);

  return (
    <div className="notification">
      <div className="notification__trigger">
        <button
          type="button"
          className="notification__bell"
          disabled={!isAuthenticated}
          onClick={() => setVisibleNotifications(!visibleNotifications)}
          //onBlur={() => setVisibleNotifications(false)}
        />
      </div>

      {visibleNotifications && (
        <div className="notification__menu" id="dropdown-menu" role="menu">
          <div className="notification__content">
            <div className="notification__buttons">
              <button
                type="button"
                className="notification__button"
                onClick={handleMarkAllAsRead}
              >
                Read all
                <span className="notification__span notification__span--done" />
              </button>
              <button
                type="button"
                className="notification__button"
                onClick={handleDeleteAll}
              >
                Clear all
                <span className="notification__span notification__span--done" />
              </button>
            </div>
            {!notifications.length && (
              <p className="notification__message">
                You have no notifications yet
              </p>
            )}
            {!!notifications.length &&
              filteredNotification.map(notification => (
                <div
                  className={classNames('notification__item', {
                    'notification__item--subscribe':
                      notification.text.includes('subscribed'),
                    'notification__item--post':
                      notification.text.includes('published'),
                    'notification__item--like':
                      notification.text.includes('liked'),
                    'notification__item--comment':
                      notification.text.includes('commented'),
                    'notification__item--read': notification.is_read,
                  })}
                >
                  <span
                    className={classNames('notification__span', {
                      'notification__span--subscribe':
                        notification.text.includes('subscribed'),
                      'notification__span--post':
                        notification.text.includes('published'),
                      'notification__span--like':
                        notification.text.includes('liked'),
                      'notification__span--comment':
                        notification.text.includes('commented'),
                    })}
                  />
                  <div className="notification__text">{notification.text.slice(0, 70)}...</div>
                  <button
                    type="button"
                    className="notification__icon notification__icon--eye"
                    onClick={() =>
                      handleMarkAsRead(notification.id, notification.text)
                    }
                  />
                  <button
                    type="button"
                    className="notification__icon notification__icon--close"
                    onClick={() =>
                      handleDelete(notification.id, notification.text)
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
