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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

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
    setSelectedPhoto(null);
    setCurrentPhotoIndex(null);
  };

  const openPhotoModal = (photo, index) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
  };

  const goToPreviousPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      const previousPhoto = photos[currentPhotoIndex - 1];
      openPhotoModal(previousPhoto, currentPhotoIndex - 1);
    }
  };

  const goToNextPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex < photos.length - 1) {
      const nextPhoto = photos[currentPhotoIndex + 1];
      openPhotoModal(nextPhoto, currentPhotoIndex + 1);
    }
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = photo.webContentLink;
    link.download = photo.name || 'foto.jpg';
    link.click();
  };

  const getFullPhotoUrl = (photo) => {
  // Intenta primero con el webContentLink (más directo)
  if (photo.webContentLink) {
    // Modificar URL para que sea directo sin preview
    return photo.webContentLink.replace('&export=download', '').replace('download', 'view');
  }
  // Si no existe, usa el photo.id
  if (photo.id) {
    return `https://drive.google.com/uc?export=view&id=${photo.id}`;
  }
  // Si nada funciona, retorna un placeholder
  return photo.thumbnailLink || '';
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
                      src={photo.thumbnailLink}
                      alt={photo.name}
                      className={styles.photoImg}
                      loading="lazy"
                      onClick={() => openPhotoModal(photo, index)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className={styles.photoModal} onClick={closePhotoModal}>
          <div className={styles.photoModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closePhotoModal}>✕</button>
            
            <div className={styles.photoContainer}>
              <img
                src={getFullPhotoUrl(selectedPhoto)}
                alt={selectedPhoto?.name}
                className={styles.photoModalImg}
              />
            </div>

            {/* Navegación entre fotos */}
            <div className={styles.photoNavigation}>
              <button 
                className={styles.navBtn}
                onClick={goToPreviousPhoto}
                disabled={currentPhotoIndex === 0}
              >
                ← Anterior
              </button>
              <span className={styles.photoCounter}>
                {currentPhotoIndex + 1} / {photos.length}
              </span>
              <button 
                className={styles.navBtn}
                onClick={goToNextPhoto}
                disabled={currentPhotoIndex === photos.length - 1}
              >
                Siguiente →
              </button>
            </div>

            {/* Info y descarga */}
            <div className={styles.photoInfo}>
              <p className={styles.photoName}>{selectedPhoto?.name}</p>
              <button 
                className={styles.downloadBtn}
                onClick={() => downloadPhoto(selectedPhoto)}
              >
                ⬇️ Descargar foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
