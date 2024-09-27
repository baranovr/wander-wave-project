import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { getMyMediaImageUrl } from "../../api/imageUtils";
import axiosInstance from '../../api/axiosInstance';
import './SubscriptionsList.scss';

interface Subscription {
  id: number;
  avatar: string;
  username: string;
  status: string;
  email: string;
  full_name: string;
  view_more: string;
  unsubscribe: string;
}

export const SubscriptionsList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axiosInstance.get('http://127.0.0.1:8008/api/user/my_profile/subscriptions/');
        setSubscriptions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch subscriptions');
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (id: number) => {
    try {
      await axiosInstance.delete(`http://127.0.0.1:8008/api/user/my_profile/subscriptions/${id}/unsubscribe/`);
      setSubscriptions(prevSubscriptions => prevSubscriptions.filter(sub => sub.id !== id));
    } catch (err) {
      setError('Failed to unsubscribe');
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="subscriptions-list">
      <h1 className="subscriptions-title">My Subscriptions</h1>
      {subscriptions.length === 0 ? (
        <h4 className="no-subscriptions">You don't have any subscriptions yet.</h4>
      ) : (
        <div className="subscriptions-table">
          {subscriptions.map(subscription => (
            <div key={subscription.id} className="subscription-row">
              <img src={getMyMediaImageUrl(subscription.avatar)} alt={subscription.username} className="subscription-avatar" />
              <div className="subscription-info">
                <h3 className="subscription-username">{subscription.username}</h3>
                <p className="subscription-status">{subscription.status}</p>
                <p className="subscription-email">{subscription.email}</p>
                <p className="subscription-fullname">{subscription.full_name}</p>
              </div>
              <div className="subscription-actions">
                <Link to={subscription.view_more} className="view-more-link">View More</Link>
                <button onClick={() => handleUnsubscribe(subscription.id)} className="unsubscribe-button">
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

