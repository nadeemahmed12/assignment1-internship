document.addEventListener('DOMContentLoaded', function() {
    // Set event ID when Get Tickets button is clicked
    const ticketButtons = document.querySelectorAll('.get-tickets-btn');
    const ticketModal = document.getElementById('ticketModal');

    if (ticketModal) {
      ticketModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        const eventId = button.getAttribute('data-event-id');
        document.getElementById('eventId').value = eventId;
      });
    }

    // Handle form submission
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
      ticketForm.addEventListener('submit', function(e) {
        e.preventDefault();
        this.submit();
      });
    }
  });