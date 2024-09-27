import '../SubscriptionsList/SubscriptionsList.scss';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import axiosInstance from '../../api/axiosInstance';
import {getMyMediaImageUrl} from "../../api/imageUtils";

interface Subscriber {
  id: number;
  avatar: string;
  username: string;
  status: string;
  email: string;
  full_name: string;
  view_more: string;
  remove_subscriber: string;
}

export const SubscribersList: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await axiosInstance.get('http://127.0.0.1:8008/api/user/my_profile/subscribers/');
        setSubscribers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch subscribers');
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const handleRemoveSubscriber = async (id: number) => {
    try {
      await axiosInstance.delete(`http://127.0.0.1:8008/api/user/my_profile/subscribers/${id}/remove_subscriber/`);
      setSubscribers(prevSubscribers => prevSubscribers.filter(sub => sub.id !== id));
    } catch (err) {
      setError('Failed to remove subscriber');
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="subscriptions-list">
      <h1 className="subscriptions-title">My Subscribers</h1>
      {subscribers.length === 0 ? (
        <h4 className="no-subscriptions">You don't have any subscribers yet.</h4>
      ) : (
        <div className="subscriptions-table">
          {subscribers.map(subscriber => (
            <div key={subscriber.id} className="subscription-row">
              <img src={getMyMediaImageUrl(subscriber.avatar)} alt={subscriber.username} className="subscription-avatar" />
              <div className="subscription-info">
                <h3 className="subscription-username">{subscriber.username}</h3>
                <p className="subscription-status">{subscriber.status}</p>
                <p className="subscription-email">{subscriber.email}</p>
                <p className="subscription-fullname">{subscriber.full_name}</p>
              </div>
              <div className="subscription-actions">
                <Link to={subscriber.view_more} className="view-more-link">View More</Link>
                <button onClick={() => handleRemoveSubscriber(subscriber.id)} className="unsubscribe-button">
                  Unsubscribe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
