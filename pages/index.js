import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/gallery.module.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const fetchPhotos = async (event) => {
    setSelectedEvent(event);
    setPhotoLoading(true);
    try {
      const response = await fetch(`/api/photos?folderId=${event.folderId}`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setPhotoLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setPhotos([]);
    setSelectedPhoto(null);
  };

  const closePhotoModal = () => {
