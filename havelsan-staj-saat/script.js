// Harita ve nokta yönetimi
let map;
let currentMarker;
let markers = [];
let markerCounter = 0;

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
    addSampleMarkers();
});

// Haritayı başlat
function initializeMap() {
    // Türkiye'nin merkezi (İstanbul)
    const defaultCenter = [41.0082, 28.9784];
    
    // Leaflet haritasını oluştur
    map = L.map('map').setView(defaultCenter, 10);
    
    // OpenStreetMap tile layer ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Harita tıklama olayı
    map.on('click', function(e) {
        if (document.getElementById('add-marker-btn').classList.contains('active')) {
            addMarkerAtPosition(e.latlng);
        }
    });
}

// Event listener'ları kur
function setupEventListeners() {
    // Konum bul butonu
    document.getElementById('locate-btn').addEventListener('click', locateUser);
    
    // Nokta ekle butonu
    document.getElementById('add-marker-btn').addEventListener('click', toggleAddMarkerMode);
}

// Kullanıcının konumunu bul
function locateUser() {
    const locationInfo = document.getElementById('current-location');
    locationInfo.textContent = 'Konum aranıyor...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Haritayı kullanıcının konumuna taşı
                map.setView([lat, lng], 15);
                
                // Mevcut konum marker'ını güncelle
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                
                // Mavi nokta ile kullanıcının konumunu göster
                currentMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'current-location-marker',
                        html: '📍',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(map);
                
                // Konum bilgisini güncelle
                locationInfo.textContent = `Enlem: ${lat.toFixed(4)}, Boylam: ${lng.toFixed(4)}`;
                
                // Popup ekle
                currentMarker.bindPopup('<b>Mevcut Konumunuz</b><br>Bu noktadasınız!').openPopup();
            },
            function(error) {
                locationInfo.textContent = 'Konum alınamadı: ' + error.message;
                console.error('Konum hatası:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        locationInfo.textContent = 'Tarayıcınız konum özelliğini desteklemiyor';
    }
}

// Nokta ekleme modunu aç/kapat
function toggleAddMarkerMode() {
    const btn = document.getElementById('add-marker-btn');
    if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        btn.textContent = '➕ Nokta Ekle';
        btn.style.background = 'rgba(255, 255, 255, 0.9)';
    } else {
        btn.classList.add('active');
        btn.textContent = '✋ Haritaya Tıklayın';
        btn.style.background = '#48bb78';
        btn.style.color = 'white';
    }
}

// Belirtilen konuma nokta ekle
function addMarkerAtPosition(latlng) {
    markerCounter++;
    const markerName = `Nokta ${markerCounter}`;
    
    // Marker oluştur
    const marker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '📍',
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    // Popup ekle
    marker.bindPopup(`
        <b>${markerName}</b><br>
        Enlem: ${latlng.lat.toFixed(4)}<br>
        Boylam: ${latlng.lng.toFixed(4)}
    `);
    
    // Marker bilgilerini sakla
    const markerInfo = {
        id: markerCounter,
        name: markerName,
        latlng: latlng,
        marker: marker
    };
    
    markers.push(markerInfo);
    
    // Nokta ekleme modunu kapat
    toggleAddMarkerMode();
    
    // Noktalar listesini güncelle
    updateMarkersList();
    
    // Popup'ı aç
    marker.openPopup();
}

// Noktalar listesini güncelle
function updateMarkersList() {
    const container = document.getElementById('markers-container');
    container.innerHTML = '';
    
    markers.forEach(markerInfo => {
        const markerElement = document.createElement('div');
        markerElement.className = 'marker-item';
        markerElement.innerHTML = `
            <div class="marker-info">
                <div class="marker-name">${markerInfo.name}</div>
                <div class="marker-coords">
                    ${markerInfo.latlng.lat.toFixed(4)}, ${markerInfo.latlng.lng.toFixed(4)}
                </div>
            </div>
            <button class="delete-marker" onclick="deleteMarker(${markerInfo.id})">🗑️</button>
        `;
        
        container.appendChild(markerElement);
    });
}

// Nokta sil
function deleteMarker(id) {
    const markerIndex = markers.findIndex(m => m.id === id);
    if (markerIndex !== -1) {
        const markerInfo = markers[markerIndex];
        
        // Haritadan marker'ı kaldır
        map.removeLayer(markerInfo.marker);
        
        // Listeden kaldır
        markers.splice(markerIndex, 1);
        
        // Listeyi güncelle
        updateMarkersList();
    }
}

// Örnek noktalar ekle
function addSampleMarkers() {
    const sampleLocations = [
        { name: 'İstanbul Havalimanı', lat: 41.2608, lng: 28.7416 },
        { name: 'Taksim Meydanı', lat: 41.0370, lng: 28.9850 },
        { name: 'Sultanahmet Camii', lat: 41.0054, lng: 28.9768 },
        { name: 'Galata Kulesi', lat: 41.0256, lng: 28.9744 }
    ];
    
    sampleLocations.forEach((location, index) => {
        setTimeout(() => {
            const latlng = L.latLng(location.lat, location.lng);
            addSampleMarker(latlng, location.name);
        }, index * 500);
    });
}

// Örnek nokta ekle
function addSampleMarker(latlng, name) {
    markerCounter++;
    
    const marker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'sample-marker',
            html: '🏛️',
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        })
    }).addTo(map);
    
    marker.bindPopup(`
        <b>${name}</b><br>
        Enlem: ${latlng.lat.toFixed(4)}<br>
        Boylam: ${latlng.lng.toFixed(4)}
    `);
    
    const markerInfo = {
        id: markerCounter,
        name: name,
        latlng: latlng,
        marker: marker
    };
    
    markers.push(markerInfo);
    updateMarkersList();
}

// Harita zoom kontrollerini özelleştir
function addCustomZoomControls() {
    const zoomIn = L.control.zoom({
        position: 'bottomright'
    });
    zoomIn.addTo(map);
}

// Harita yüklendikten sonra zoom kontrollerini ekle
setTimeout(addCustomZoomControls, 1000);
