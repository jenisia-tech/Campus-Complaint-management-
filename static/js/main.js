// Campus Complaint Management System - Client Side Scripts

document.addEventListener('DOMContentLoaded', function () {
    // Auto dismiss alert messages after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 5000);
    });

    // Confirmation dialog for withdraw forms
    const withdrawForms = document.querySelectorAll('form[action*="withdraw"]');
    withdrawForms.forEach(function (form) {
        form.addEventListener('submit', function (e) {
            const confirmed = confirm("Are you sure you want to withdraw this complaint? This will permanently close the complaint.");
            if (!confirmed) {
                e.preventDefault();
            }
        });
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
