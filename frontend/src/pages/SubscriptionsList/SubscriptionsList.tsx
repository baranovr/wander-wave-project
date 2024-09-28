import React, { useEffect, useState } from 'react';
import { Loader } from '../../components/Loader';
import { getMyMediaImageUrl } from "../../api/imageUtils";
import axiosInstance from '../../api/axiosInstance';
import './SubscriptionsList.scss';

interface Subscription {
  id: number;
  avatar: string;
  status: string;
  username: string;
  email: string;
  full_name: string;
  about_me: string;
  date_joined: string;
  subscribers: number;
  subscriptions: number;
}

export const SubscriptionsList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);

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

  const toggleCardExpansion = (id: number) => {
    setExpandedCards(prev =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
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
            <div key={subscription.id} className={`subscription-card ${expandedCards.includes(subscription.id) ? 'expanded' : ''}`}>
              <div className="subscription-header">
                <img src={getMyMediaImageUrl(subscription.avatar)} alt={subscription.username} className="subscription-avatar" />
                <div className="subscription-basic-info">
                  <h3 className="subscription-username">{subscription.username}</h3>
                  <p className="subscription-status">{subscription.status}</p>
                </div>
                <div className="subscription-actions">
                  <button onClick={() => toggleCardExpansion(subscription.id)} className="view-more-button">
                    {expandedCards.includes(subscription.id) ? 'View Less' : 'View More'}
                  </button>
                  <button onClick={() => handleUnsubscribe(subscription.id)} className="unsubscribe-button">
                    Unsubscribe
                  </button>
                </div>
              </div>
              {expandedCards.includes(subscription.id) && (
                <div className="subscription-details">
                  <p><strong>Email:</strong> {subscription.email}</p>
                  <p><strong>Full Name:</strong> {subscription.full_name}</p>
                  <p><strong>About Me:</strong> {subscription.about_me}</p>
                  <p><strong>Date Joined:</strong> {subscription.date_joined.slice(0, 10).split('-').reverse().join('.')}</p>
                  <p><strong>Subscribers:</strong> {subscription.subscribers}</p>
                  <p><strong>Subscriptions:</strong> {subscription.subscriptions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
