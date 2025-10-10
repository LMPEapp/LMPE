self.addEventListener('notificationclick', function(event) {
  console.log('Notification click event:', event);

  event.notification.close(); // ferme la notification
  console.log('Notification fermée:', event.notification.title);

  // Vérifie si une fenêtre du site est déjà ouverte
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      console.log('Fenêtres ouvertes:', clientList.length);
      for (const client of clientList) {
        console.log('Client URL:', client.url);
        if (client.url.includes('/') && 'focus' in client) {
          console.log('Focus sur la fenêtre existante');
          return client.focus(); // focus sur la fenêtre existante
        }
      }
      // Sinon, ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        console.log('Aucune fenêtre existante, ouverture d\'une nouvelle');
        return clients.openWindow('/');
      }
    })
  );

  // Actions spécifiques
  if (event.action === 'explore') {
    console.log('Action explore détectée, ouverture de /home');
    event.waitUntil(clients.openWindow('/home'));
  }
});
