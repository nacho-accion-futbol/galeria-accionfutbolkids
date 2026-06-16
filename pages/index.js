import { useState, useEffect } from 'react';
import styles from '../styles/gallery.module.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);
  const [previewPhotos, setPreviewPhotos] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
      
      // Cargar fotos preview para cada evento
      data.forEach((event, index) => {
        loadPreviewPhotos(event, index);
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const loadPreviewPhotos = async (event, eventIndex) => {
    try {
      const response = await fetch(`/api/photos?folderId=${event.folderId}`);
      const data = await response.json();
      setPreviewPhotos((prev) => ({
        ...prev,
        [eventIndex]: data.slice(0, 3),
      }));
    } catch (error) {
      console.error('Error loading preview photos:', error);
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

  const getPhotoUrl = (photo) => {
    if (photo.id) {
      return `https://lh3.googleusercontent.com/d/${photo.id}=w500-h500`;
    }
    if (photo.webContentLink) {
      return photo.webContentLink;
    }
    return '';
  };

  const getFullPhotoUrl = (photo) => {
    if (photo.id) {
      return `https://lh3.googleusercontent.com/d/${photo.id}`;
    }
    if (photo.webContentLink) {
      return photo.webContentLink;
    }
    return '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>ACCIÓN FÚTBOL</h1>
          <p className={styles.subtitle}>Galería de eventos</p>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loader}>Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className={styles.empty}>No hay eventos disponibles</div>
        ) : (
          <div className={styles.grid}>
            {events.map((event, index) => {
              const eventPreviewPhotos = previewPhotos[index] || [];
              return (
                <div
                  key={index}
                  className={styles.card}
                  onClick={() => fetchPhotos(event)}
                >
                  <div className={styles.cardDate}>{event.date}</div>

                  <div className={styles.photosPreview}>
                    {eventPreviewPhotos && eventPreviewPhotos.length > 0 ? (
                      eventPreviewPhotos.map((photo, photoIndex) => (
                        <div key={photoIndex} className={styles.photoPreviewItem}>
                          <img
                            src={getPhotoUrl(photo)}
                            alt={`Preview ${photoIndex + 1}`}
                            className={styles.photoPreviewImg}
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/200?text=Foto+${photoIndex + 1}`;
                            }}
                          />
                        </div>
                      ))
                    ) : null}
                    {eventPreviewPhotos.length < 3 && (
                      <>
                        {[...Array(3 - eventPreviewPhotos.length)].map((_, i) => (
                          <div
                            key={`placeholder-${i}`}
                            className={styles.photoPreviewPlaceholder}
                          ></div>
                        ))}
                      </>
                    )}
                  </div>

                  <button className={styles.viewButton}>
                    Ver galería ({eventPreviewPhotos.length} fotos)
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedEvent && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            <p className={styles.modalTitle}>{selectedEvent.date}</p>

            {photoLoading ? (
              <div className={styles.modalLoader}>Cargando fotos...</div>
            ) : photos.length === 0 ? (
              <div className={styles.modalEmpty}>No hay fotos disponibles</div>
            ) : (
              <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img
                      src={getPhotoUrl(photo)}
                      alt={photo.name}
                      className={styles.photoImg}
                      loading="lazy"
                      onClick={() => openPhotoModal(photo, index)}
                      style={{ cursor: 'pointer' }}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/150?text=Foto`;
                      }}
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
