self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // ferme la notification

  // Vérifie si une fenêtre du site est déjà ouverte
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus(); // focus sur la fenêtre existante
        }
      }
      // Sinon, ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );

  // Tu peux faire d’autres actions selon l’action cliquée
  if (event.action === 'explore') {
    // Exemple : ouvrir une URL spécifique
    event.waitUntil(clients.openWindow('/home'));
  }
});
