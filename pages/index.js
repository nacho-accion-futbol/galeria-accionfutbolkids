import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/gallery.module.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);

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
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>ACCIÓN FÚTBOL</h1>
          <p className={styles.subtitle}>Galería de eventos y entrenamientos</p>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loader}>Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className={styles.empty}>No hay eventos disponibles</div>
        ) : (
          <div className={styles.grid}>
            {events.map((event, index) => (
              <div
                key={index}
                className={styles.card}
                onClick={() => fetchPhotos(event)}
              >
                <div
                  className={styles.cardHeader}
                  style={{
                    background: event.gradient,
                  }}
                >
                  <h3 className={styles.cardTitle}>{event.date}</h3>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.placeholders}>
                    <div className={styles.placeholder}></div>
                    <div className={styles.placeholder}></div>
                    <div className={styles.placeholder}></div>
                  </div>
                  <button className={styles.viewButton}>
                    Ver fotos →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedEvent && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            <p className={styles.modalDate}>{selectedEvent.date}</p>

            {photoLoading ? (
              <div className={styles.modalLoader}>Cargando fotos...</div>
            ) : photos.length === 0 ? (
              <div className={styles.modalEmpty}>No hay fotos disponibles</div>
            ) : (
              <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img
                      src={photo.thumbnailLink || photo.webContentLink}
                      alt={photo.name}
                      className={styles.photoImg}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
