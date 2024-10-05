import '../SubscriptionsList/SubscriptionsList.scss';
import React, { useEffect, useState } from 'react';
import { Loader } from '../../components/Loader';
import axiosInstance from '../../api/axiosInstance';
import {getMyMediaImageUrl} from "../../api/imageUtils";

interface Subscriber {
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

export const SubscribersList: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);

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

    const toggleCardExpansion = (id: number) => {
    setExpandedCards(prev =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
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
            <div key={subscriber.id} className={`subscription-card ${expandedCards.includes(subscriber.id) ? 'expanded' : ''}`}>
              <div className="subscription-header">
                <img src={getMyMediaImageUrl(subscriber.avatar)} alt={subscriber.username} className="subscription-avatar" />
                <div className="subscription-basic-info">
                  <h3 className="subscription-username">{subscriber.username}</h3>
                  <p className="subscription-status">{subscriber.status}</p>
                  <h5 className="point">
                    .
                  </h5>
                  <p className="subscription-about-me"><strong>About me:</strong>{subscriber.about_me.slice(0, 50)}...</p>
                </div>
                <div className="subscription-actions">
                  <button onClick={() => toggleCardExpansion(subscriber.id)} className="view-more-button">
                    {expandedCards.includes(subscriber.id) ? 'View Less' : 'View More'}
                  </button>
                  <button onClick={() => handleRemoveSubscriber(subscriber.id)} className="unsubscribe-button">
                    Remove subscriber
                  </button>
                </div>
              </div>
              {expandedCards.includes(subscriber.id) && (
                  <div className="subscription-details">
                    <p><strong>Email:</strong> {subscriber.email}</p>
                    <p><strong>Full Name:</strong> {subscriber.full_name}</p>
                    <p className="about-me"><strong>About user:</strong> {subscriber.about_me}</p>
                    <p><strong>Date Joined:</strong> {subscriber.date_joined.slice(0, 10).split('-').reverse().join('.')}</p>
                    <p><strong>Subscribers:</strong> {subscriber.subscribers}</p>
                    <p><strong>Subscriptions:</strong> {subscriber.subscriptions}</p>
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

